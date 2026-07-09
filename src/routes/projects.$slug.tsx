import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProjectBySlug, mediaUrl } from "@/lib/content";

const SITE = "https://waylinestudio.lovable.app";

export const Route = createFileRoute("/projects/$slug")({
  ssr: false,
  component: ProjectPage,
  loader: async ({ params }) => {
    try {
      return await fetchProjectBySlug(params.slug);
    } catch {
      return null;
    }
  },
  head: ({ params, loaderData }) => {
    const p = loaderData;
    const title = p ? `${p.title} — Wayline` : "Project — Wayline";
    const desc = p?.summary ?? "Selected work from Wayline — wayfinding for public space.";
    const url = `${SITE}/projects/${params.slug}`;
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
              "@type": "CreativeWork",
              name: p.title,
              description: desc,
              url,
              image: img ?? undefined,
              creator: { "@type": "Organization", name: "Wayline Studio" },
              dateCreated: p.year ?? undefined,
              locationCreated: p.location ?? undefined,
            }),
          }]
        : undefined,
    };
  },
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const { data: project, isLoading } = useQuery({
    queryKey: ["public-project", slug],
    queryFn: () => fetchProjectBySlug(slug),
  });

  if (isLoading) {
    return <div className="min-h-dvh flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!project) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-3xl">Project not found</h1>
        <Link to="/" className="text-sm text-accent">← Back home</Link>
      </div>
    );
  }

  const coverUrl = mediaUrl(project.cover_image);

  return (
    <article className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto max-w-[1400px] px-6 md:px-10 pt-16 pb-10">
        <Link to="/" className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground hover:text-accent">← Wayline</Link>
        <div className="mt-10 grid md:grid-cols-[1fr_320px] gap-10 items-end">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">{project.client ?? "Selected work"}</p>
            <h1 className="mt-4 font-display text-[clamp(2rem,5vw,4.5rem)] leading-[1] tracking-[-0.03em]">{project.title}</h1>
            {project.summary && <p className="mt-6 max-w-xl text-lg text-muted-foreground">{project.summary}</p>}
          </div>
          <dl className="grid grid-cols-2 gap-y-4 font-mono text-[11px] tracking-[0.18em] uppercase">
            <dt className="text-muted-foreground">Year</dt><dd>{project.year ?? "—"}</dd>
            <dt className="text-muted-foreground">Location</dt><dd>{project.location ?? "—"}</dd>
            <dt className="text-muted-foreground">Disciplines</dt>
            <dd className="text-foreground/80">{project.disciplines.join(", ") || "—"}</dd>
          </dl>
        </div>
      </header>
      {coverUrl && (
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <img src={coverUrl} alt={project.title} className="w-full aspect-[16/9] object-cover border border-hairline" />
        </div>
      )}
      {project.body && (
        <div className="mx-auto max-w-3xl px-6 py-20 prose prose-invert" dangerouslySetInnerHTML={{ __html: project.body }} />
      )}
      {project.gallery.length > 0 && (
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 pb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.gallery.map((g) => {
            const u = mediaUrl(g);
            return u ? <img key={g} src={u} alt="" loading="lazy" className="w-full aspect-[4/3] object-cover border border-hairline" /> : null;
          })}
        </div>
      )}
    </article>
  );
}
