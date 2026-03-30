"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/songs", label: "Songs" },
  { href: "/videos", label: "Videos" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <a href="/" className="text-sm font-bold text-foreground">
          Music Library
        </a>
        <div className="flex gap-4">
          {links.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <a
                key={href}
                href={href}
                className={cn(
                  "text-sm transition-colors",
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
