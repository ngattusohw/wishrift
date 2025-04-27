import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PriceChart from "@/components/PriceChart";
import PriceAlertModal from "@/components/PriceAlertModal";
import { Bell, Share2, Trash2, Heart } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { WishListItem as WishListItemType, PriceAlert } from "@shared/schema";

// Function to format price for display
const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2);
};

// Calculate price change percentage
const calculatePriceChange = (currentPrice: number, originalPrice: number): string => {
  if (originalPrice === 0) return "0%";
  const change = ((currentPrice - originalPrice) / originalPrice) * 100;
  return `${change > 0 ? "+" : ""}${change.toFixed(0)}%`;
};

interface WishListItemProps {
  item: WishListItemType;
  priceHistory: { price: number; date: Date }[];
  priceAlert?: PriceAlert;
  onShareItem?: (item: WishListItemType) => void;
}

const WishListItem = ({ item, priceHistory, priceAlert, onShareItem }: WishListItemProps) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);
  
  // Determine if price has dropped or increased
  const priceChange = item.originalPrice ? calculatePriceChange(item.currentPrice, item.originalPrice) : null;
  const hasPriceDropped = item.originalPrice && item.currentPrice < item.originalPrice;
  const hasPriceIncreased = item.originalPrice && item.currentPrice > item.originalPrice;
  
  // Mutation for updating favorite status
  const updateFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/items/${item.id}`, {
        isFavorite: !isFavorite
      });
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${item.wishListId}/items`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for deleting the item
  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/items/${item.id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${item.wishListId}/items`] });
      toast({
        title: "Success",
        description: "Item was successfully removed from your wishlist"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  });

  const handleFavoriteToggle = () => {
    updateFavoriteMutation.mutate();
  };

  const handleShare = () => {
    if (onShareItem) {
      onShareItem(item);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img 
          src={item.imageUrl || "https://images.unsplash.com/photo-1606820854416-439b3305dd39?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} 
          alt={item.name} 
          className="wishlist-item-image"
        />
        
        {priceChange && (hasPriceDropped || hasPriceIncreased) && (
          <span className={`absolute top-3 right-3 ${hasPriceDropped ? 'bg-primary' : 'bg-red-500'} text-white text-xs px-2 py-1 rounded`}>
            {hasPriceDropped ? '-' : '+'}${formatPrice(Math.abs(item.currentPrice - item.originalPrice))}
          </span>
        )}
        
        <button 
          className={`absolute top-3 left-3 ${isFavorite ? 'text-primary' : 'text-secondary'} bg-white rounded-full p-1 shadow hover:text-primary`}
          onClick={handleFavoriteToggle}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-inter font-semibold text-lg">{item.name}</h3>
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <span className={`${hasPriceDropped ? 'text-green-500' : hasPriceIncreased ? 'text-red-500' : ''} font-semibold mr-1`}>
                ${formatPrice(item.currentPrice)}
              </span>
              {item.originalPrice && item.originalPrice !== item.currentPrice && (
                <span className="text-gray-400 line-through text-sm">
                  ${formatPrice(item.originalPrice)}
                </span>
              )}
            </div>
            {priceChange && (hasPriceDropped || hasPriceIncreased) && (
              <div className={`text-xs ${hasPriceDropped ? 'text-green-500' : 'text-red-500'} mt-1`}>
                {hasPriceDropped ? 'Price dropped' : 'Price increased'} {priceChange}
              </div>
            )}
            {!priceChange && (
              <div className="text-xs text-gray-500 mt-1">
                Stable price
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mt-1">{item.store}</p>
        
        <div className="mt-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-500">Price History</span>
              <span className="text-xs font-medium text-accent">3 months</span>
            </div>
            <PriceChart data={priceHistory} height={48} />
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
              {item.category}
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PriceAlertModal itemId={item.id} existingAlert={priceAlert}>
                    <button className={`${priceAlert ? 'text-warning' : 'text-gray-400 hover:text-accent'}`}>
                      <Bell className="h-4 w-4" fill={priceAlert ? "currentColor" : "none"} />
                    </button>
                  </PriceAlertModal>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{priceAlert ? 'Manage price alert' : 'Set price alert'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-400 hover:text-accent" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share item</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {item.name} from your wish list.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteItemMutation.mutate()}>
                          {deleteItemMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete item</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishListItem;
