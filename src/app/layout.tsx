import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NewTube",
    template: "%s | NewTube",
  },
  description: "Video sharing and discovery platform",
  keywords: ["video", "content", "share", "creator", "youtube clone"],
  authors: [{ name: "Quetrea Galaxies" }],
  creator: "Quetrea Galaxies",
  publisher: "NewTube",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://newtube.example.com",
    siteName: "NewTube",
    title: "NewTube",
    description: "Video sharing and discovery platform",
    images: [
      {
        url: "/images/og-image.jpg", // Replace with a real image
        width: 1200,
        height: 630,
        alt: "NewTube",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NewTube",
    description: "Video sharing and discovery platform",
    images: ["/images/twitter-image.jpg"], // Replace with a real image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={"/"}>
      <html lang="en">
        <body className={inter.className}>
          <TRPCProvider>
            <Toaster />
            {children}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
