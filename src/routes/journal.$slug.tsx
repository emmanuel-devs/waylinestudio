import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  POST_BY_SLUG_QUERY,
  sanity,
  urlFor,
  type SanityPost,
} from "@/lib/sanity";

type Block = { _type: string; children?: { text?: string }[] };

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: async () => {
      const data = await sanity.fetch<SanityPost | null>(POST_BY_SLUG_QUERY, { slug });
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(postQuery(params.slug)),
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Journal — Wayline" }, { name: "robots", content: "noindex" }] };
    const p = loaderData;
    const title = `${p.title} — Wayline Journal`;
    const desc = p.excerpt ?? p.title;
    const img = p.cover ? urlFor(p.cover).width(1200).height(630).fit("crop").auto("format").url() : null;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(img ? [{ property: "og:image", content: img }] : []),
      ],
    };
  },
  component: PostPage,
  notFoundComponent: () => (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-40 text-center">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">404</p>
        <h1 className="mt-6 font-display text-4xl tracking-[-0.02em]">Entry not found</h1>
        <Link to="/" className="mt-8 inline-block text-sm text-accent hover:underline">← Back home</Link>
      </div>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-40 text-center">
        <h1 className="font-display text-2xl">Couldn't load this entry</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </main>
  ),
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(postQuery(slug));
  const date = p.publishedAt ? new Date(p.publishedAt) : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 pt-32 pb-32 md:pt-40">
        <Link
          to="/"
          hash="journal"
          className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground transition-colors hover:text-accent"
        >
          ← Journal
        </Link>
        <p className="mt-16 font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
          <span className="text-accent">●</span> {p.category ?? "Note"}
          {date ? <> · {date.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</> : null}
        </p>
        <h1 className="mt-6 font-display text-[clamp(2rem,4.5vw,4rem)] leading-[1.05] tracking-[-0.03em]">
          {p.title}
        </h1>
        {p.excerpt ? (
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{p.excerpt}</p>
        ) : null}

        <div className="prose prose-invert mt-16 max-w-none space-y-6 text-base leading-[1.75] text-foreground/85">
          {(p.body as Block[] | undefined)?.map((b, i) =>
            b._type === "block" ? (
              <p key={i}>{b.children?.map((c) => c.text).join("")}</p>
            ) : null,
          )}
        </div>
      </article>
    </main>
  );
}
