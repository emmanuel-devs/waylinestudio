import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProjectBySlug, mediaUrl } from "@/lib/content";

export const Route = createFileRoute("/projects/$slug")({
  ssr: false,
  component: ProjectPage,
  head: () => ({ meta: [{ title: "Project — Wayline" }] }),
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const { data: project, isLoading } = useQuery({
    queryKey: ["public-project", slug],
    queryFn: () => fetchProjectBySlug(slug),
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-3xl">Project not found</h1>
        <Link to="/" className="text-sm text-accent">← Back home</Link>
      </div>
    );
  }

  const coverUrl = mediaUrl(project.cover_image);

  return (
    <article className="min-h-screen bg-background text-foreground">
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
            return u ? <img key={g} src={u} alt="" className="w-full aspect-[4/3] object-cover border border-hairline" /> : null;
          })}
        </div>
      )}
    </article>
  );
}
