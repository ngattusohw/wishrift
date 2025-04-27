import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

interface ProductSearchProps {
  onSelectProduct: (product: any) => void;
}

interface ProductResult {
  name: string;
  price: number;
  imageUrl?: string;
  productUrl: string;
  store: string;
  isAvailable: boolean;
}

export function ProductSearch({ onSelectProduct }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest("POST", "/api/items/search", {
        query: searchQuery
      });
      return await response.json();
    },
    onSuccess: (data: ProductResult[]) => {
      setResults(data);
    },
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      mutate(query);
    }
  };
  
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for a product..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isPending || !query.trim()}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          {isPending ? "Searching..." : "Search"}
        </Button>
      </form>
      
      {isPending && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}
      
      {!isPending && results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Found {results.length} results across {new Set(results.map(r => r.store)).size} retailers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((product, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="relative pb-[56.25%] bg-muted">
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 bg-secondary text-white px-2 py-1 rounded text-xs font-medium">
                      {product.store}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectProduct(product)}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {!isPending && query && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No products found. Try a different search term or add manually.
        </div>
      )}
    </div>
  );
}