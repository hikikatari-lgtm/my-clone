// Theory ツールは独立アプリ theory-tools に切り出し済み（2026-08-19）
// https://github.com/hikikatari-lgtm/my-clone の public/theory は廃止予定
export const THEORY_TOOLS_URL = "https://theory-tools.vercel.app";

/** ピアノ弾き語り教室のコード入門コース。Songs の表の読み方を学べる場所 */
export const PIANO_BASICS_URL = "https://piano.hikikatari.com/basics";

export const SITE_MODE = process.env.NEXT_PUBLIC_SITE_MODE || "public";

export const isPublicMode = SITE_MODE === "public";
export const isPrivateMode = SITE_MODE === "private";

export const publicNavItems = [
  { href: "/songs", label: "Songs" },
  { href: "/videos", label: "Videos" },
  { href: "/artists", label: "Artists" },
  { href: "/history", label: "History" },
  { href: THEORY_TOOLS_URL, label: "Theory" },
  { href: "/blog", label: "Blog" },
];

export const privateNavItems = [
  { href: "/songs", label: "Songs" },
  { href: "/videos", label: "Videos" },
  { href: "/artists", label: "Artists" },
  { href: "/novels", label: "📖 Novels" },
  { href: "/english", label: "📚 English" },
  { href: "/movies", label: "🎬 Movies" },
  { href: "/history", label: "History" },
  { href: THEORY_TOOLS_URL, label: "Theory" },
  { href: "/blog", label: "Blog" },
];

export const navItems = isPublicMode ? publicNavItems : privateNavItems;
