export const SITE_MODE = process.env.NEXT_PUBLIC_SITE_MODE || "public";

export const isPublicMode = SITE_MODE === "public";
export const isPrivateMode = SITE_MODE === "private";

export const publicNavItems = [
  { href: "/songs", label: "Songs" },
  { href: "/videos", label: "Videos" },
  { href: "/artists", label: "Artists" },
  { href: "/history", label: "History" },
  { href: "/theory", label: "Theory" },
];

export const privateNavItems = [
  { href: "/songs", label: "Songs" },
  { href: "/videos", label: "Videos" },
  { href: "/artists", label: "Artists" },
  { href: "/novels", label: "📖 Novels" },
  { href: "/english", label: "📚 English" },
  { href: "/movies", label: "🎬 Movies" },
  { href: "/history", label: "History" },
  { href: "/theory", label: "Theory" },
];

export const navItems = isPublicMode ? publicNavItems : privateNavItems;
