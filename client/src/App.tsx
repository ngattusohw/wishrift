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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wishlists/:id" component={WishList} />
      <Route path="/alerts" component={PriceAlerts} />
      <Route path="/shared-with-me" component={SharedWithMe} />
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
