import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchPostBySlug, mediaUrl } from "@/lib/content";

export const Route = createFileRoute("/journal/$slug")({
  ssr: false,
  component: PostPage,
  head: () => ({ meta: [{ title: "Journal — Wayline" }] }),
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["public-post", slug],
    queryFn: () => fetchPostBySlug(slug),
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-3xl">Post not found</h1>
        <Link to="/" className="text-sm text-accent">← Back home</Link>
      </div>
    );
  }

  const coverUrl = mediaUrl(post.cover_image);

  return (
    <article className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-3xl px-6 pt-16 pb-10">
        <Link to="/" className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground hover:text-accent">← Wayline</Link>
        <p className="mt-10 font-mono text-[11px] tracking-[0.22em] uppercase text-accent">{post.category ?? "Note"}</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.03em]">{post.title}</h1>
        <p className="mt-4 font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
          {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
        </p>
      </header>
      {coverUrl && (
        <div className="mx-auto max-w-[1200px] px-6">
          <img src={coverUrl} alt={post.title} className="w-full aspect-[16/9] object-cover border border-hairline" />
        </div>
      )}
      {post.body && (
        <div className="mx-auto max-w-3xl px-6 py-16 prose prose-invert" dangerouslySetInnerHTML={{ __html: post.body }} />
      )}
    </article>
  );
}
