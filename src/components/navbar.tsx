'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ModeToggle } from '@/components/toggle';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Menu, 
  Target, 
  Lightbulb, 
  TrendingUp,
  Zap,
  PlusCircle,
  Sparkles,
  BarChart,
  Users,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    title: 'Campaign Lab',
    href: '/campaign/new',
    description: 'Create and simulate marketing campaigns',
    icon: Target,
  },
  {
    title: 'Creative Tester',
    href: '/creative-tester',
    description: 'Score and optimize your ad copy',
    icon: Lightbulb,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b transition-all duration-200",
      isScrolled 
        ? "border-border bg-background/95 backdrop-blur-lg shadow-sm supports-[backdrop-filter]:bg-background/80" 
        : "border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="w-full max-w-screen-2xl mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Side - Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 group-hover:from-primary/90 group-hover:to-primary transition-all duration-200 shadow-sm group-hover:shadow-md">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  Virtual Campaign Lab
                </span>
                <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
                  <Sparkles className="h-2 w-2 mr-1" />
                  MVP
                </Badge>
              </div>
            </div>
            <span className="sm:hidden font-bold text-lg">VCL</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex ml-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-10 px-4 font-medium">
                    Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[440px] gap-3 p-4 md:w-[520px] md:grid-cols-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'group grid h-auto w-full items-center justify-start gap-2 rounded-lg border border-border bg-background p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
                            pathname === item.href && 'bg-accent'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                              <item.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-sm font-semibold leading-none">
                              {item.title}
                            </div>
                          </div>
                          <div className="line-clamp-2 text-sm leading-snug text-muted-foreground ml-11">
                            {item.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Quick Action Buttons */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link href="/campaign/new">
              <Button size="sm" className="h-10 px-4 shadow-sm hover:shadow-md transition-all">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </Link>
            <Link href="/creative-tester">
              <Button size="sm" variant="outline" className="h-10 px-4 hover:bg-accent transition-all">
                <Zap className="h-4 w-4 mr-2" />
                Test Copy
              </Button>
            </Link>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center">
            <ModeToggle />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
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
                    <span>Virtual Campaign Lab</span>
                    <Badge variant="secondary" className="text-xs">MVP</Badge>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Quick Actions
                    </h4>
                    <div className="grid gap-3">
                      <Link href="/campaign/new" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full justify-start h-12 px-4" size="sm">
                          <PlusCircle className="h-4 w-4 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">New Campaign</div>
                            <div className="text-xs text-primary-foreground/80">Create & simulate</div>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/creative-tester" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start h-12 px-4" size="sm">
                          <Zap className="h-4 w-4 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">Test Copy</div>
                            <div className="text-xs text-muted-foreground">Score ad text</div>
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <Separator />

                  {/* Navigation Links */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Tools
                    </h4>
                    <div className="space-y-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent/50',
                            pathname === item.href && 'bg-accent'
                          )}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <item.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground leading-tight">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Stats */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Platform Stats</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-primary">10+</div>
                        <div className="text-xs text-muted-foreground">Channels</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-primary">95%</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                    </div>
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