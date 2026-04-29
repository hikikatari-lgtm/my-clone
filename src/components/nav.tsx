"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-40 overflow-x-auto border-b border-border bg-background">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-4 px-4 sm:px-6">
        {items.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className={cn(
              "whitespace-nowrap text-sm transition-colors",
              isActive(href)
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
