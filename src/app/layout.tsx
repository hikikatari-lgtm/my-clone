import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
        <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex h-12 max-w-6xl items-center gap-6 px-4 sm:px-6">
            <Link href="/" className="text-sm font-bold text-foreground">
              Music Library
            </Link>
            <div className="flex gap-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Songs
              </Link>
              <Link
                href="/videos"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Videos
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
