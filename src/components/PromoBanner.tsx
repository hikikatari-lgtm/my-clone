"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function PromoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative flex h-[50px] w-full items-center justify-center bg-[#E8621A] px-4">
      <p className="text-sm text-white">
        🎸 All Access FREE Trial!{" "}
        <a href="#" className="font-medium text-white underline hover:text-white/90">
          Start Now &gt;
        </a>
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/80 transition-colors hover:text-white"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
