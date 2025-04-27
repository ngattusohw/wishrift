import { useState } from "react";
import { Link, useLocation } from "wouter";
import { BadgePoundSterling, Menu, Bell, LogIn } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };
  
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BadgePoundSterling className="text-primary h-6 w-6" />
            <h1 className="text-xl font-bold font-inter text-secondary">
              WishRift
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <span className="text-foreground font-inter font-medium hover:text-primary transition cursor-pointer">
                My Wish Lists
              </span>
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/alerts">
                  <span className="text-foreground font-inter font-medium hover:text-primary transition cursor-pointer">
                    Price Alerts
                  </span>
                </Link>
                <Link href="/shared-with-me">
                  <span className="text-foreground font-inter font-medium hover:text-primary transition cursor-pointer">
                    Shared With Me
                  </span>
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <button className="hidden md:block text-accent hover:text-primary transition">
                <Bell className="h-5 w-5" />
              </button>
            )}

            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated && user ? (
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || ""} alt={user.username} />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block font-medium">{user.username}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-accent hover:text-primary"
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}

            <button
              className="md:hidden text-secondary"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1 border-t border-gray-200">
            <Link href="/">
              <span className="block py-2 text-base font-medium text-foreground hover:text-primary cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                My Wish Lists
              </span>
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/alerts">
                  <span className="block py-2 text-base font-medium text-foreground hover:text-primary cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                    Price Alerts
                  </span>
                </Link>
                <Link href="/shared-with-me">
                  <span className="block py-2 text-base font-medium text-foreground hover:text-primary cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                    Shared With Me
                  </span>
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start py-2 text-base font-medium text-foreground hover:text-primary"
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4 mr-2" />
                <span>Login</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
