import { useState } from "react";
import { Link, useLocation } from "wouter";
import { BadgePoundSterling, Menu, Bell } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BadgePoundSterling className="text-primary h-6 w-6" />
            <h1 className="text-xl font-bold font-inter text-secondary">
              WishTrack
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <a className="text-foreground font-inter font-medium hover:text-primary transition">
                My Wish Lists
              </a>
            </Link>
            <Link href="/alerts">
              <a className="text-foreground font-inter font-medium hover:text-primary transition">
                Price Alerts
              </a>
            </Link>
            <Link href="/shared-with-me">
              <a className="text-foreground font-inter font-medium hover:text-primary transition">
                Shared With Me
              </a>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="hidden md:block text-accent hover:text-primary transition">
              <Bell className="h-5 w-5" />
            </button>

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block font-medium">Sarah</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
              <a className="block py-2 text-base font-medium text-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                My Wish Lists
              </a>
            </Link>
            <Link href="/alerts">
              <a className="block py-2 text-base font-medium text-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Price Alerts
              </a>
            </Link>
            <Link href="/shared-with-me">
              <a className="block py-2 text-base font-medium text-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Shared With Me
              </a>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
