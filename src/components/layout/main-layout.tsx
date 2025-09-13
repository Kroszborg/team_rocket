"use client";

import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  containerClass?: string;
  variant?: "default" | "wide" | "narrow";
}

const containerVariants = {
  default: "container mx-auto px-4 sm:px-6 lg:px-8",
  wide: "w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8",
  narrow: "w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
};

export function MainLayout({
  children,
  showFooter = true,
  containerClass,
  variant = "default",
}: MainLayoutProps) {
  const footerLinks = [
    { label: "Campaign Lab", href: "/campaign/new" },
    { label: "Creative Tester", href: "/creative-tester" },
    { label: "Campaigns", href: "/campaigns" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 relative">
        {/* Subtle Background Pattern - Reduced opacity for better readability */}
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:60px_60px] pointer-events-none opacity-20" />

        {/* Content Container with improved contrast and readability */}
        <div className={containerClass || containerVariants[variant]}>
          <div className="py-6 sm:py-8 lg:py-12 relative z-10">{children}</div>
        </div>
      </main>

      {showFooter && (
        <footer className="border-t bg-muted/30 mt-auto">
          <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
                    <svg
                      className="h-4 w-4 text-primary-foreground"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v4h8V3h-8z" />
                    </svg>
                  </div>
                  <span className="font-bold text-lg text-foreground">
                    Adsim
                  </span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    MVP
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6 max-w-md text-sm">
                  The safe place for founders to practice and perfect their
                  marketing campaigns before spending real money.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4 text-sm">Platform</h4>
                <ul className="space-y-2">
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
            </div>

            {/* Bottom Bar */}
            <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                © 2024 Adsim. Practice smart, spend smarter.
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
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
