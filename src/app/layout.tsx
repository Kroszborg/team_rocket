import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://virtualcampaignlab.com'),
  title: {
    default: "Virtual Campaign Lab",
    template: "%s | Virtual Campaign Lab"
  },
  description: "A powerful marketing campaign simulation and optimization platform. Test, simulate, and optimize your marketing campaigns across multiple channels with AI-powered creative scoring and data-driven insights.",
  keywords: [
    "marketing campaign",
    "campaign simulation",
    "marketing optimization",
    "ad creative testing",
    "ROI calculator",
    "digital marketing",
    "campaign analytics",
    "marketing tools",
    "advertising platform",
    "marketing simulation",
    "creative scoring",
    "multi-channel marketing"
  ],
  authors: [{ name: "Team Rocket" }],
  creator: "Team Rocket",
  publisher: "Virtual Campaign Lab",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://virtualcampaignlab.com",
    siteName: "Virtual Campaign Lab",
    title: "Virtual Campaign Lab - Marketing Campaign Simulation Platform",
    description: "Test, simulate, and optimize your marketing campaigns across multiple channels with AI-powered creative scoring and data-driven insights.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Virtual Campaign Lab - Marketing Campaign Simulation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@virtualcampaignlab",
    creator: "@virtualcampaignlab",
    title: "Virtual Campaign Lab - Marketing Campaign Simulation Platform",
    description: "Test, simulate, and optimize your marketing campaigns across multiple channels with AI-powered insights.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "technology",
  classification: "Marketing Tools",
  referrer: "origin-when-cross-origin",
};

import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}