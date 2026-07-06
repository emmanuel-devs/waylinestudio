import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  PROJECT_BY_SLUG_QUERY,
  sanity,
  urlFor,
  type SanityProject,
} from "@/lib/sanity";

const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: async () => {
      const data = await sanity.fetch<SanityProject | null>(PROJECT_BY_SLUG_QUERY, { slug });
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(projectQuery(params.slug)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Project — Wayline" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData;
    const title = `${p.title} — Wayline`;
    const desc = p.summary ?? `${p.title}, a Wayline project${p.location ? ` in ${p.location}` : ""}.`;
    const img = p.cover ? urlFor(p.cover).width(1200).height(630).fit("crop").auto("format").url() : null;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
    };
  },
  component: ProjectPage,
  notFoundComponent: () => (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-40 text-center">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">404</p>
        <h1 className="mt-6 font-display text-4xl tracking-[-0.02em]">Project not found</h1>
        <Link to="/" className="mt-8 inline-block text-sm text-accent underline-offset-4 hover:underline">
          ← Back to index
        </Link>
      </div>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-40 text-center">
        <h1 className="font-display text-2xl">Couldn't load this project</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </main>
  ),
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(projectQuery(slug));
  const coverUrl = p.cover ? urlFor(p.cover).width(1800).height(1000).fit("crop").auto("format").url() : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 pt-32 pb-32 md:px-10 md:pt-40">
        <Link
          to="/"
          hash="projects"
          className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground transition-colors hover:text-accent"
        >
          ← Selected work
        </Link>

        <header className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              <span className="text-accent">●</span> {p.client ?? "Confidential"}
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[1] tracking-[-0.03em]">
              {p.title}
            </h1>
            {p.summary ? (
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {p.summary}
              </p>
            ) : null}
          </div>
          <aside className="space-y-6 md:col-span-4">
            <Meta label="Location" value={p.location} />
            <Meta label="Year" value={p.year?.toString()} />
            {p.disciplines?.length ? (
              <div>
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
                  Disciplines
                </p>
                <ul className="mt-3 space-y-1 text-sm text-foreground/85">
                  {p.disciplines.map((d) => (
                    <li key={d}>— {d}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </header>

        {coverUrl ? (
          <figure className="mt-20 overflow-hidden border border-hairline">
            <img src={coverUrl} alt={p.title} className="h-auto w-full" />
          </figure>
        ) : null}

        {p.gallery?.length ? (
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {p.gallery.map((g, i) => {
              const src = urlFor(g).width(1200).height(900).fit("crop").auto("format").url();
              return (
                <figure key={i} className="overflow-hidden border border-hairline">
                  <img src={src} alt={`${p.title} — ${i + 1}`} className="h-auto w-full" loading="lazy" />
                </figure>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">{label}</p>
      <p className="mt-3 text-sm text-foreground/85">{value}</p>
    </div>
  );
}
