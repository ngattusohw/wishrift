import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useSharedList } from "@/hooks/useWishLists";
import WishListItem from "@/components/WishListItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronLeft, Search } from "lucide-react";
import type { WishListItem as WishListItemType } from "@shared/schema";

const SharedList = () => {
  const params = useParams<{ shareId: string }>();
  const [, setLocation] = useLocation();
  const { wishList, items, isLoading, error } = useSharedList(params.shareId);
  const [filteredItems, setFilteredItems] = useState<WishListItemType[]>([]);
  const [category, setCategory] = useState<string>("All Categories");
  const [sortBy, setSortBy] = useState<string>("Date Added");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Check if there's an item ID in the query params
  const searchParams = new URLSearchParams(window.location.search);
  const highlightedItemId = searchParams.get("item") ? parseInt(searchParams.get("item")!) : null;

  // Update filtered items whenever the source items or filters change
  useEffect(() => {
    if (!items) return;

    let result = [...items];

    // Filter by category
    if (category !== "All Categories") {
      result = result.filter(item => item.category === category);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description?.toLowerCase().includes(query) ||
        item.store.toLowerCase().includes(query)
      );
    }

    // Sort items
    switch (sortBy) {
      case "Price: Low to High":
        result.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case "Name: A to Z":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // Date Added
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // If there's a highlighted item, make sure it appears at the top
    if (highlightedItemId) {
      const index = result.findIndex(item => item.id === highlightedItemId);
      if (index > -1) {
        const item = result.splice(index, 1)[0];
        result.unshift(item);
      }
    }

    setFilteredItems(result);
  }, [items, category, sortBy, searchQuery, highlightedItemId]);

  // Get unique categories for filter dropdown
  const categories = items 
    ? ["All Categories", ...new Set(items.map(item => item.category))]
    : ["All Categories"];

  // Mock price history data for each item (would be real in a production app)
  const getPriceHistoryForItem = (itemId: number) => {
    // For MVP, we'll create some simulated price history
    const now = new Date();
    return [
      { price: items?.find(i => i.id === itemId)?.currentPrice || 0, date: now },
      { price: items?.find(i => i.id === itemId)?.originalPrice || 0, date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      { price: items?.find(i => i.id === itemId)?.originalPrice || 0, date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
      { price: items?.find(i => i.id === itemId)?.originalPrice || 0, date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000) },
    ];
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-secondary font-inter mb-2">
          Shared List Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The shared wishlist you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => setLocation("/")}>
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Shared List Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <Link href="/">
                <a className="inline-flex items-center text-accent hover:text-primary mb-2">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Home
                </a>
              </Link>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-72" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold leading-7 text-secondary font-inter sm:text-3xl sm:truncate">
                    {wishList?.title || "Shared Wish List"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {filteredItems.length} items - Shared with you
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wish List Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="flex space-x-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by: Date Added" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Date Added">Sort by: Date Added</SelectItem>
                  <SelectItem value="Price: Low to High">Price: Low to High</SelectItem>
                  <SelectItem value="Price: High to Low">Price: High to Low</SelectItem>
                  <SelectItem value="Name: A to Z">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                className="pl-10"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Wish List Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Skeleton className="h-[180px] w-full" />
                <div className="p-4 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full rounded-md" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">
              Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className={highlightedItemId === item.id ? "ring-2 ring-primary rounded-lg" : ""}>
                <WishListItem
                  item={item}
                  priceHistory={getPriceHistoryForItem(item.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SharedList;
