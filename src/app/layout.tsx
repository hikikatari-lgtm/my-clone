import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { navItems, isPrivateMode } from "@/lib/site-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Library",
  description: "Browse and discover your music collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav items={navItems} />
        {children}
        {isPrivateMode && (
          <div className="fixed bottom-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded-full opacity-70 z-50">
            🔒 Private Mode
          </div>
        )}
      </body>
    </html>
  );
}
