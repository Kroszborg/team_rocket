"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart3,
  Menu,
  Target,
  Lightbulb,
  PlusCircle,
  Sparkles,
  User,
  LogOut,
  Settings,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-200",
        isScrolled
          ? "border-border bg-background/95 backdrop-blur-lg shadow-sm supports-[backdrop-filter]:bg-background/80"
          : "border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="w-full max-w-screen-2xl mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Side - Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 group-hover:from-primary/90 group-hover:to-primary transition-all duration-200 shadow-sm group-hover:shadow-md">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-foreground">Adsim</span>
                <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
                  <Sparkles className="h-2 w-2 mr-1" />
                  MVP
                </Badge>
              </div>
            </div>
            <span className="sm:hidden font-bold text-lg text-foreground">
              Adsim
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex ml-8">
            <nav className="flex items-center space-x-6">
              <Link
                href="/campaign/new"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/campaign/new"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Campaign Lab
              </Link>
              <Link
                href="/creative-tester"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/creative-tester"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Creative Tester
              </Link>
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === "/dashboard"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/campaigns"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === "/campaigns"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    My Campaigns
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <ModeToggle />

          {user ? (
            <>
              {/* Quick Action Button for authenticated users */}
              <div className="hidden lg:flex items-center">
                <Link href="/campaign/new">
                  <Button size="sm" className="h-9 px-4">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                </Link>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={undefined} alt={user.full_name || user.email} />
                      <AvatarFallback>
                        {(user.full_name || user.email || 'U').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/campaigns" className="w-full cursor-pointer">
                      <History className="mr-2 h-4 w-4" />
                      <span>My Campaigns</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Login/Signup buttons for non-authenticated users */}
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="h-9">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="h-9">
                    Get Started
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="default" size="sm" className="h-10 w-10 p-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <BarChart3 className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span>Adsim</span>
                    <Badge variant="secondary" className="text-xs">
                      MVP
                    </Badge>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col space-y-4 mt-8">
                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link
                      href="/campaign/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent/50",
                        pathname === "/campaign/new" && "bg-accent"
                      )}
                    >
                      <Target className="h-4 w-4 text-primary" />
                      <span>Campaign Lab</span>
                    </Link>
                    <Link
                      href="/creative-tester"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent/50",
                        pathname === "/creative-tester" && "bg-accent"
                      )}
                    >
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span>Creative Tester</span>
                    </Link>
                    
                    {user ? (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent/50",
                            pathname === "/dashboard" && "bg-accent"
                          )}
                        >
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/campaigns"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent/50",
                            pathname === "/campaigns" && "bg-accent"
                          )}
                        >
                          <History className="h-4 w-4 text-primary" />
                          <span>My Campaigns</span>
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent/50",
                            pathname === "/profile" && "bg-accent"
                          )}
                        >
                          <Settings className="h-4 w-4 text-primary" />
                          <span>Profile</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent/50",
                            pathname === "/login" && "bg-accent"
                          )}
                        >
                          <User className="h-4 w-4 text-primary" />
                          <span>Sign In</span>
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent/50 bg-primary text-primary-foreground",
                            pathname === "/register" && "bg-primary/80"
                          )}
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>Get Started</span>
                        </Link>
                      </>
                    )}
                  </div>
                  
                  {user && (
                    <div className="border-t pt-4">
                      <button
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent/50 text-red-600 w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
