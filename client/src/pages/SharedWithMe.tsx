import { useState } from "react";
import { Link } from "wouter";
import { useSharedWithMe } from "@/hooks/useWishLists";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, ChevronLeft, User, Users } from "lucide-react";

const SharedWithMe = () => {
  const { sharedLists, isLoading, error } = useSharedWithMe();

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/">
            <a className="inline-flex items-center text-accent hover:text-primary mb-2">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Home
            </a>
          </Link>
          <h1 className="text-2xl font-bold text-secondary font-inter">Shared With Me</h1>
        </div>
        <Card className="text-center p-8">
          <div className="flex flex-col items-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <User className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-xl font-medium mb-2">
              Error Loading Shared Lists
            </CardTitle>
            <CardDescription className="max-w-md mx-auto mb-6">
              There was a problem loading the lists shared with you. Please try again later.
            </CardDescription>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/">
          <a className="inline-flex items-center text-accent hover:text-primary mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Home
          </a>
        </Link>
        <h1 className="text-2xl font-bold text-secondary font-inter">Shared With Me</h1>
        <p className="text-muted-foreground">
          Wish lists that have been shared with you by friends and family.
        </p>
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
      ) : !sharedLists || sharedLists.length === 0 ? (
        <Card className="text-center p-8">
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 p-3 rounded-full mb-4">
              <Users className="h-8 w-8 text-gray-500" />
            </div>
            <CardTitle className="text-xl font-medium mb-2">
              No Lists Shared With You Yet
            </CardTitle>
            <CardDescription className="max-w-md mx-auto mb-6">
              When someone shares their wish list with you, it will appear here. 
              You can then view the items they've added and help them track prices.
            </CardDescription>
            <Link href="/">
              <Button>
                Go to My Wish Lists
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sharedLists.map((list) => (
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
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>
                    Shared {new Date(list.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/shared/${list.shareId}`}>
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

export default SharedWithMe;
