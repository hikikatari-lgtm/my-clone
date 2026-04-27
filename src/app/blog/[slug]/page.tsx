import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchBlogPostBySlug, fetchBlogBlocks } from "@/lib/notion";
import { NotionRenderer } from "@/components/notion-renderer";

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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  if (!post) notFound();

  const blocks = await fetchBlogBlocks(post.id).catch(() => []);
  const date = formatDate(post.publishedAt);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          {post.category && (
            <div className="mb-3 text-xs font-medium text-muted-foreground">
              {post.category}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {post.title}
          </h1>
          {date && (
            <div className="mt-3 text-sm text-muted-foreground">{date}</div>
          )}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.coverImage && (
          <div className="mb-8 overflow-hidden rounded-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt=""
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="text-base">
          <NotionRenderer blocks={blocks} />
        </div>
      </article>
    </main>
  );
}
