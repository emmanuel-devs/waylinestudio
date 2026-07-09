import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchPostBySlug, mediaUrl } from "@/lib/content";

const SITE = "https://waylinestudio.lovable.app";

export const Route = createFileRoute("/journal/$slug")({
  ssr: false,
  component: PostPage,
  loader: async ({ params }) => {
    try {
      return await fetchPostBySlug(params.slug);
    } catch {
      return null;
    }
  },
  head: ({ params, loaderData }) => {
    const p = loaderData;
    const title = p ? `${p.title} — Wayline Journal` : "Journal — Wayline";
    const desc = p?.excerpt ?? "Notes from the studio.";
    const url = `${SITE}/journal/${params.slug}`;
    const img = mediaUrl(p?.cover_image ?? null);
    const meta = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
    ];
    if (img) {
      meta.push({ property: "og:image", content: img });
      meta.push({ name: "twitter:image", content: img });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: p
        ? [{
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: p.title,
              description: desc,
              url,
              image: img ?? undefined,
              datePublished: p.published_at ?? undefined,
              articleSection: p.category ?? undefined,
              author: { "@type": "Organization", name: "Wayline Studio" },
            }),
          }]
        : undefined,
    };
  },
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["public-post", slug],
    queryFn: () => fetchPostBySlug(slug),
  });

  if (isLoading) {
    return <div className="min-h-dvh flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!post) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-3xl">Post not found</h1>
        <Link to="/" className="text-sm text-accent">← Back home</Link>
      </div>
    );
  }

  const coverUrl = mediaUrl(post.cover_image);

  return (
    <article className="min-h-dvh bg-background text-foreground">
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
