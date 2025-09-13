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
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Menu,
  Target,
  Lightbulb,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
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
              <Link
                href="/campaigns"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/campaigns"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Campaigns
              </Link>
            </nav>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Quick Action Button */}
          <div className="hidden lg:flex items-center">
            <Link href="/campaign/new">
              <Button size="sm" className="h-9 px-4">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </Link>
          </div>

          {/* Theme Toggle */}
          <ModeToggle />

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
                    <Link
                      href="/campaigns"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent/50",
                        pathname === "/campaigns" && "bg-accent"
                      )}
                    >
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span>Campaigns</span>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
