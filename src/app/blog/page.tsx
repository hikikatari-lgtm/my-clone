import Link from "next/link";
import { fetchBlogPosts } from "@/lib/notion";
import type { BlogPost } from "@/types/blog";

export const revalidate = 60;

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogCard({ post }: { post: BlogPost }) {
  const date = formatDate(post.publishedAt);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-lg overflow-hidden border border-border bg-card transition-colors hover:border-foreground/20"
    >
      {post.coverImage ? (
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-muted" />
      )}
      <div className="flex flex-1 flex-col p-5">
        {post.category && (
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            {post.category}
          </div>
        )}
        <h2 className="text-base font-bold text-foreground line-clamp-2 mb-2 leading-snug">
          {post.title}
        </h2>
        {post.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {post.summary}
          </p>
        )}
        {date && (
          <div className="mt-4 text-xs text-muted-foreground">{date}</div>
        )}
      </div>
    </Link>
  );
}

export default async function BlogIndexPage() {
  let posts: BlogPost[];
  try {
    posts = await fetchBlogPosts();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[BlogIndex] Failed to fetch posts:", message);
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Blog</h1>
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600">
          記事の取得に失敗しました: {message}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Blog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {posts.length}件の記事
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          公開中の記事はまだありません。
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
