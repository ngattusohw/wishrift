import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";
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
import { type PriceAlert, type WishListItem } from "@shared/schema";

// Function to format price for display
const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2);
};

interface AlertWithItem extends PriceAlert {
  item?: WishListItem;
}

const PriceAlerts = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertWithItem[]>([]);

  // Fetch all wishlists to get information about the items
  const { data: wishlists, isLoading: wishlistsLoading } = useQuery({
    queryKey: ["/api/wishlists"],
  });

  // Fetch items for each wishlist
  const { data: allItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/items-with-alerts"],
    queryFn: async () => {
      if (!wishlists) return [];
      
      const allItemsPromises = wishlists.map(list => 
        fetch(`/api/wishlists/${list.id}/items`).then(res => res.json())
      );
      
      return (await Promise.all(allItemsPromises)).flat();
    },
    enabled: !!wishlists,
  });

  // Fetch all price alerts
  const { data: allAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/all-alerts"],
    queryFn: async () => {
      if (!allItems) return [];
      
      const alertsPromises = allItems.map(item => 
        fetch(`/api/items/${item.id}/alerts`).then(res => res.json())
      );
      
      return (await Promise.all(alertsPromises)).flat();
    },
    enabled: !!allItems,
  });

  // Combine alerts with their corresponding items
  useEffect(() => {
    if (allAlerts && allItems) {
      const alertsWithItems = allAlerts.map(alert => {
        return {
          ...alert,
          item: allItems.find(item => item.id === alert.itemId)
        };
      });
      setAlerts(alertsWithItems);
    }
  }, [allAlerts, allItems]);

  // Toggle alert status mutation
  const toggleAlertMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/alerts/${id}`, {
        isActive: !isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/all-alerts"] });
      toast({
        title: "Alert updated",
        description: "Price alert status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update alert",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/alerts/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/all-alerts"] });
      toast({
        title: "Alert deleted",
        description: "Price alert has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete alert",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleToggleAlert = (id: number, isActive: boolean) => {
    toggleAlertMutation.mutate({ id, isActive });
  };

  const handleDeleteAlert = (id: number) => {
    deleteAlertMutation.mutate(id);
  };

  const isLoading = wishlistsLoading || itemsLoading || alertsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/">
          <a className="inline-flex items-center text-accent hover:text-primary mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Home
          </a>
        </Link>
        <h1 className="text-2xl font-bold text-secondary font-inter">Price Alerts</h1>
        <p className="text-muted-foreground">
          Monitor price drops and get notified when items reach your target price.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-2 border-b">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : alerts.length === 0 ? (
        <Card className="text-center p-8">
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl font-medium mb-2">
              No Price Alerts Set
            </CardTitle>
            <CardDescription className="max-w-md mx-auto mb-6">
              You haven't set any price alerts yet. Add items to your wish list and set alerts to be notified of price drops.
            </CardDescription>
            <Link href="/">
              <Button>Go to My Wish Lists</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Active Price Alerts</CardTitle>
            <CardDescription>
              You have {alerts.filter(a => a.isActive).length} active price alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Target Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      {alert.item ? (
                        <div>
                          <Link href={`/wishlists/${alert.item.wishListId}?item=${alert.item.id}`}>
                            <a className="text-accent hover:text-primary font-medium">
                              {alert.item.name}
                            </a>
                          </Link>
                          <div className="text-xs text-muted-foreground">{alert.item.store}</div>
                        </div>
                      ) : (
                        "Unknown Item"
                      )}
                    </TableCell>
                    <TableCell>
                      {alert.item ? (
                        <span className="font-medium">
                          ${formatPrice(alert.item.currentPrice)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${formatPrice(alert.targetPrice)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {alert.isActive ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          <BellOff className="mr-1 h-3 w-3" /> Paused
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAlert(alert.id, alert.isActive)}
                        >
                          {alert.isActive ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                          <span className="sr-only">{alert.isActive ? "Pause" : "Activate"}</span>
                        </Button>
                        
                        <Link href={`/wishlists/${alert.item?.wishListId}`}>
                          <Button variant="outline" size="sm">
                            <LinkIcon className="h-4 w-4" />
                            <span className="sr-only">Go to item</span>
                          </Button>
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this price alert. You will no longer be notified when the price drops.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteAlert(alert.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default PriceAlerts;
