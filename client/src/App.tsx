import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import WishList from "@/pages/WishList";
import PriceAlerts from "@/pages/PriceAlerts";
import SharedWithMe from "@/pages/SharedWithMe";
import SharedList from "@/pages/SharedList";
import { useAuth } from "./hooks/useAuth";
import { Loader2 } from "lucide-react";

// Protected route wrapper
const ProtectedRoute = ({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    window.location.href = "/api/login";
    return null;
  }
  
  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wishlists/:id">
        {(params) => <ProtectedRoute component={WishList} id={params.id} />}
      </Route>
      <Route path="/alerts">
        {() => <ProtectedRoute component={PriceAlerts} />}
      </Route>
      <Route path="/shared-with-me">
        {() => <ProtectedRoute component={SharedWithMe} />}
      </Route>
      <Route path="/shared/:shareId" component={SharedList} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
