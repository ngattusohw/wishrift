import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

const FormSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  productUrl: z.string().url("Please enter a valid URL"),
  currentPrice: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Price must be a positive number" }
  ),
  store: z.string().min(1, "Store is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid image URL").optional(),
  enablePriceAlert: z.boolean().default(false),
  targetPrice: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface AddItemModalProps {
  wishlistId: number;
  children: React.ReactNode;
}

const AddItemModal = ({ wishlistId, children }: AddItemModalProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      productUrl: "",
      currentPrice: "",
      store: "Amazon",
      category: "Electronics",
      description: "",
      imageUrl: "",
      enablePriceAlert: false,
      targetPrice: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      // First create the wishlist item
      const priceInCents = Math.round(parseFloat(values.currentPrice) * 100);
      
      const itemResponse = await apiRequest("POST", `/api/wishlists/${wishlistId}/items`, {
        name: values.name,
        description: values.description || "",
        currentPrice: priceInCents,
        originalPrice: priceInCents,
        productUrl: values.productUrl,
        store: values.store,
        category: values.category,
        imageUrl: values.imageUrl || "",
        isFavorite: false,
      });
      
      const newItem = await itemResponse.json();
      
      // If price alert is enabled, create an alert
      if (values.enablePriceAlert && values.targetPrice) {
        const targetPriceInCents = Math.round(parseFloat(values.targetPrice) * 100);
        await apiRequest("POST", `/api/items/${newItem.id}/alerts`, {
          targetPrice: targetPriceInCents,
          isActive: true,
        });
      }
      
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${wishlistId}/items`] });
      toast({
        title: "Item added successfully",
        description: "Your item has been added to the wishlist.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add item",
        description: error.message || "An error occurred while adding the item.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Item to Wish List</DialogTitle>
          <DialogDescription>
            Enter the details of the item you want to track.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="PlayStation 5, iPad Pro, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          placeholder="0.00"
                          className="pl-7"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="store"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a store" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Amazon">Amazon</SelectItem>
                        <SelectItem value="Best Buy">Best Buy</SelectItem>
                        <SelectItem value="Target">Target</SelectItem>
                        <SelectItem value="Walmart">Walmart</SelectItem>
                        <SelectItem value="Apple Store">Apple Store</SelectItem>
                        <SelectItem value="GameStop">GameStop</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Home & Kitchen">
                        Home & Kitchen
                      </SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Books">Books</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enablePriceAlert"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set a price alert</FormLabel>
                    <FormDescription>
                      Get notified when price drops below target.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("enablePriceAlert") && (
              <FormField
                control={form.control}
                name="targetPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          placeholder="0.00"
                          className="pl-7"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
