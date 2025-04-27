import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { type PriceAlert as PriceAlertType } from "@shared/schema";

interface PriceAlertModalProps {
  children: React.ReactNode;
  itemId: number;
  existingAlert?: PriceAlertType;
}

const FormSchema = z.object({
  targetPrice: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Price must be a positive number" }
  ),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof FormSchema>;

const PriceAlertModal = ({ children, itemId, existingAlert }: PriceAlertModalProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      targetPrice: existingAlert ? (existingAlert.targetPrice / 100).toFixed(2) : "",
      isActive: existingAlert ? existingAlert.isActive : true,
    },
  });

  useEffect(() => {
    if (existingAlert) {
      form.reset({
        targetPrice: (existingAlert.targetPrice / 100).toFixed(2),
        isActive: existingAlert.isActive,
      });
    }
  }, [existingAlert, form]);

  const createAlertMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const targetPriceInCents = Math.round(parseFloat(values.targetPrice) * 100);
      return await apiRequest("POST", `/api/items/${itemId}/alerts`, {
        targetPrice: targetPriceInCents,
        isActive: values.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/items/${itemId}/alerts`] });
      toast({
        title: "Price alert created",
        description: "You'll be notified when the price drops below your target.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create alert",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!existingAlert) return;
      
      const targetPriceInCents = Math.round(parseFloat(values.targetPrice) * 100);
      return await apiRequest("PUT", `/api/alerts/${existingAlert.id}`, {
        targetPrice: targetPriceInCents,
        isActive: values.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/items/${itemId}/alerts`] });
      toast({
        title: "Price alert updated",
        description: "Your price alert has been updated successfully.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update alert",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async () => {
      if (!existingAlert) return;
      return await apiRequest("DELETE", `/api/alerts/${existingAlert.id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/items/${itemId}/alerts`] });
      toast({
        title: "Price alert deleted",
        description: "Your price alert has been removed.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete alert",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    if (existingAlert) {
      updateAlertMutation.mutate(values);
    } else {
      createAlertMutation.mutate(values);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingAlert ? "Manage Price Alert" : "Set Price Alert"}
          </DialogTitle>
          <DialogDescription>
            {existingAlert
              ? "Update or remove your price alert notification."
              : "Get notified when the price drops below your target."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Input placeholder="0.00" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    You'll be notified when the price drops below this amount.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Alert Status</FormLabel>
                    <FormDescription>
                      {field.value ? "Alert is active" : "Alert is paused"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              {existingAlert && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deleteAlertMutation.mutate()}
                  disabled={deleteAlertMutation.isPending}
                >
                  {deleteAlertMutation.isPending ? "Deleting..." : "Delete Alert"}
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAlertMutation.isPending || updateAlertMutation.isPending}
                >
                  {(createAlertMutation.isPending || updateAlertMutation.isPending)
                    ? "Saving..."
                    : existingAlert
                    ? "Update Alert"
                    : "Set Alert"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PriceAlertModal;
