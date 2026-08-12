import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GlobalSound } from "../components/GlobalSound";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "HVL",
  description: "HVL music experience",
  icons: {
    icon: [
      { url: "/images/hvl-favicon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
      { url: "/images/hvl-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/hvl-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/images/hvl-apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "HVL",
    description: "HVL music experience",
    images: [{ url: "/images/hvl-share.png", width: 1200, height: 1200, alt: "HVL" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVL",
    description: "HVL music experience",
    images: ["/images/hvl-share.png"],
  },
  appleWebApp: {
    capable: true,
    title: "HVL",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <GlobalSound />
        {children}
      </body>
    </html>
  );
}
