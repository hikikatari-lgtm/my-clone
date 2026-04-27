"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <a href="/" className="text-sm font-bold text-foreground">
          Music Library
        </a>

        <div className="hidden md:flex md:gap-4">
          {items.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={cn(
                "text-sm transition-colors",
                isActive(href)
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </a>
          ))}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 p-2 text-foreground md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav-menu"
          className="border-b border-border bg-background md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2 sm:px-6">
            {items.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-sm transition-colors",
                  isActive(href)
                    ? "bg-muted font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-12 z-30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
