import type { NextConfig } from "next";

// Theory ツール（Blues / Chord Functions / Minor Scale Matrix）は
// 独立アプリ theory-tools に移設した（2026-08-19）。
// 旧URLのブックマーク・既存リンクを新アプリへ恒久リダイレクトする。
const THEORY_TOOLS_URL = "https://theory-tools.vercel.app";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/theory", destination: THEORY_TOOLS_URL, permanent: true },
      {
        source: "/theory/blues.html",
        destination: `${THEORY_TOOLS_URL}/blues.html`,
        permanent: true,
      },
      {
        source: "/theory/chords.html",
        destination: `${THEORY_TOOLS_URL}/chords.html`,
        permanent: true,
      },
      {
        source: "/theory/minor-matrix.html",
        destination: `${THEORY_TOOLS_URL}/minor-matrix.html`,
        permanent: true,
      },
      // 上記以外の /theory/* も念のため新アプリのトップへ
      { source: "/theory/:path*", destination: THEORY_TOOLS_URL, permanent: true },
    ];
  },
};

export default nextConfig;
