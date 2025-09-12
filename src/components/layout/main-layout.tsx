'use client';

import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  containerClass?: string;
  variant?: 'default' | 'wide' | 'narrow';
}

const containerVariants = {
  default: 'container mx-auto px-4 sm:px-6 lg:px-8',
  wide: 'w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8',
  narrow: 'w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
};

export function MainLayout({ 
  children, 
  showFooter = true, 
  containerClass,
  variant = 'default' 
}: MainLayoutProps) {
  const footerLinks = [
    { label: 'Campaign Lab', href: '/campaign/new' },
    { label: 'Creative Tester', href: '/creative-tester' },
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api-docs' },
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-muted/5 pointer-events-none" />
        
        {/* Content Container with improved responsive padding */}
        <div className={containerClass || containerVariants[variant]}>
          <div className="py-6 sm:py-8 lg:py-12">
            {children}
          </div>
        </div>
      </main>
      
      {showFooter && (
        <footer className="border-t bg-muted/30 backdrop-blur-sm mt-auto">
          <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Brand */}
              <div className="sm:col-span-2 lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
                    <svg className="h-4 w-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v4h8V3h-8z"/>
                    </svg>
                  </div>
                  <span className="font-bold text-lg">Virtual Campaign Lab</span>
                  <Badge variant="secondary" className="text-xs shrink-0">MVP</Badge>
                </div>
                <p className="text-muted-foreground mb-6 max-w-md text-sm sm:text-base">
                  The safe place for founders to practice and perfect their marketing campaigns 
                  before spending real money. Test strategies, optimize budgets, and maximize ROI.
                </p>
                <div className="flex items-center space-x-2">
                  {socialLinks.map((link) => (
                    <Button
                      key={link.label}
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
                      asChild
                    >
                      <Link href={link.href} target="_blank">
                        <link.icon className="h-4 w-4" />
                        <span className="sr-only">{link.label}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4 text-sm sm:text-base">Platform</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {footerLinks.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        className="text-muted-foreground hover:text-primary transition-colors text-sm block py-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-4 text-sm sm:text-base">Support</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li>
                    <Link 
                      href="mailto:support@virtualcampaignlab.com" 
                      className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center py-1"
                    >
                      <Mail className="h-3 w-3 mr-2 shrink-0" />
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/help" 
                      className="text-muted-foreground hover:text-primary transition-colors text-sm block py-1"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/feedback" 
                      className="text-muted-foreground hover:text-primary transition-colors text-sm block py-1"
                    >
                      Send Feedback
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/changelog" 
                      className="text-muted-foreground hover:text-primary transition-colors text-sm block py-1"
                    >
                      What's New
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                © 2024 Virtual Campaign Lab. Practice smart, spend smarter.
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center">
                  Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> for founders
                </span>
                <span className="hidden sm:inline">•</span>
                <span>MVP v1.0</span>
                <span className="hidden sm:inline">•</span>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy
                </Link>
                <span className="hidden sm:inline">•</span>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}