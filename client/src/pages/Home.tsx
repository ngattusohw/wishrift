import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useWishLists } from "@/hooks/useWishLists";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, List, ShoppingBag } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Home = () => {
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { wishLists, isLoading, createWishList } = useWishLists();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createWishList.mutate(values, {
      onSuccess: (data) => {
        setDialogOpen(false);
        form.reset();
        setLocation(`/wishlists/${data.id}`);
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary font-inter">My Wish Lists</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Wish List</DialogTitle>
              <DialogDescription>
                Create a new wish list to start tracking items you want.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My Wishlist" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name of your wish list.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Items I want to track..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createWishList.isPending}>
                    {createWishList.isPending ? "Creating..." : "Create List"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full rounded-md" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : !wishLists || wishLists.length === 0 ? (
        <Card className="text-center p-8">
          <div className="flex flex-col items-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl font-medium mb-2">
              No Wish Lists Yet
            </CardTitle>
            <CardDescription className="max-w-md mx-auto mb-6">
              Create your first wish list to start tracking prices of items you want to buy.
            </CardDescription>
            <Button onClick={() => setDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First List
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishLists.map((list) => (
            <Card key={list.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">{list.title}</CardTitle>
                {list.description && (
                  <CardDescription className="line-clamp-2">
                    {list.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <List className="mr-2 h-4 w-4" />
                  <span>
                    {list.updatedAt
                      ? `Updated ${new Date(list.updatedAt).toLocaleDateString()}`
                      : "New list"}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/wishlists/${list.id}`}>
                  <Button className="w-full">View List</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
