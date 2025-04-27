import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Loader2, ExternalLink, Store, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

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
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">
              Found <span className="text-primary font-bold">{results.length}</span> results across <span className="text-primary font-bold">{new Set(results.map(r => r.store)).size}</span> retailers
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((product, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow border-muted">
                <CardContent className="p-0">
                  <div className="relative pb-[56.25%] bg-muted">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Skeleton className="w-full h-full" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      <Store className="h-3 w-3 mr-1" />
                      {product.store}
                    </Badge>
                    {!product.isAvailable && (
                      <Badge className="absolute top-2 left-2" variant="destructive">
                        Out of stock
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2 h-10">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-lg text-primary">{formatPrice(product.price)}</span>
                      <a 
                        href={product.productUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-muted-foreground flex items-center hover:text-primary"
                      >
                        View <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-4 py-3 bg-muted/20 border-t">
                  <Button 
                    className="w-full"
                    variant="default" 
                    size="sm"
                    onClick={() => onSelectProduct(product)}
                    disabled={!product.isAvailable}
                  >
                    {product.isAvailable ? "Add to Wishlist" : "Out of Stock"}
                  </Button>
                </CardFooter>
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