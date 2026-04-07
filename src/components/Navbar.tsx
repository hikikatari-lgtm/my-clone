"use client";

import Link from "next/link";
import { ChevronDown, Search, ShoppingCart, Bell } from "lucide-react";
const navLinks = ["Learn", "Play", "Explore"] as const;

export function Navbar() {
  return (
    <nav className="sticky top-0 z-[1020] h-[71px] w-full border-b border-[#333] bg-[#1A1A1A]">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/directline-logo.svg"
            alt="Directline Studio"
            className="h-8 w-auto"
          />
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link}>
                <button
                  type="button"
                  className="flex items-center gap-0.5 rounded px-3 py-2 font-[Roboto,sans-serif] text-[14.4px] text-white/80 transition-colors hover:text-[#E8621A]"
                >
                  {link}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            <li>
              <Link
                href="/novels"
                className="flex items-center gap-1 rounded px-3 py-2 font-[Roboto,sans-serif] text-[14.4px] text-white/80 transition-colors hover:text-[#E8621A]"
              >
                📖 Novel Library
              </Link>
            </li>
          </ul>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by genre, instrument, or style..."
              className="h-9 w-[400px] rounded-full border border-[#444] bg-[#2a2a2a] pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#E8621A] focus:outline-none"
            />
          </div>

          {/* Icons */}
          <button type="button" className="rounded p-1.5 text-white/70 transition-colors hover:text-[#E8621A]" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button type="button" className="rounded p-1.5 text-white/70 transition-colors hover:text-[#E8621A]" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>

          {/* User avatar placeholder */}
          <div className="h-8 w-8 rounded-full bg-[#444]" aria-label="User avatar" />
        </div>
      </div>
    </nav>
  );
}
