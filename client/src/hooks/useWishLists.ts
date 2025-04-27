import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import type { WishList, WishListItem, PriceHistory, PriceAlert } from "@shared/schema";

export function useWishLists() {
  const { toast } = useToast();

  const { data: wishLists, isLoading, error } = useQuery<WishList[]>({
    queryKey: ["/api/wishlists"],
  });

  const createWishList = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/wishlists", {
        ...data,
        userId: 1, // Using demo user ID for now
        shareId: nanoid(10),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists"] });
      toast({
        title: "Success",
        description: "Wish list created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create wish list: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    wishLists,
    isLoading,
    error,
    createWishList,
  };
}

export function useWishList(id: number) {
  const { data: wishList, isLoading, error } = useQuery<WishList>({
    queryKey: [`/api/wishlists/${id}`],
  });

  const { data: items, isLoading: itemsLoading, error: itemsError } = useQuery<WishListItem[]>({
    queryKey: [`/api/wishlists/${id}/items`],
    enabled: !!id,
  });

  return {
    wishList,
    items,
    isLoading: isLoading || itemsLoading,
    error: error || itemsError,
  };
}

export function useWishListItem(id: number) {
  const { data: item, isLoading, error } = useQuery<WishListItem>({
    queryKey: [`/api/items/${id}`],
    enabled: !!id,
  });

  const { data: priceHistory, isLoading: historyLoading, error: historyError } = useQuery<PriceHistory[]>({
    queryKey: [`/api/items/${id}/history`],
    enabled: !!id,
  });

  const { data: priceAlerts, isLoading: alertsLoading, error: alertsError } = useQuery<PriceAlert[]>({
    queryKey: [`/api/items/${id}/alerts`],
    enabled: !!id,
  });

  return {
    item,
    priceHistory,
    priceAlerts: priceAlerts && priceAlerts.length > 0 ? priceAlerts[0] : undefined,
    isLoading: isLoading || historyLoading || alertsLoading,
    error: error || historyError || alertsError,
  };
}

export function useSharedList(shareId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/shared/${shareId}`],
    enabled: !!shareId,
  });

  return {
    wishList: data?.wishlist,
    items: data?.items,
    isLoading,
    error,
  };
}

export function useSharedWithMe() {
  const { data: sharedLists, isLoading, error } = useQuery<WishList[]>({
    queryKey: ["/api/shared-with-me"],
  });

  return {
    sharedLists,
    isLoading,
    error,
  };
}
