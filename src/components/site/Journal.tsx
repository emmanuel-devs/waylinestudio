import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { fetchPublishedPosts } from "@/lib/content";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function Journal() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["public-posts"],
    queryFn: fetchPublishedPosts,
  });

  return (
    <section id="journal" className="relative border-t border-hairline bg-background py-32 md:py-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-20 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              <span className="text-accent">●</span> Journal / 03
            </p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
              Notes from <br /> the studio.
            </h2>
          </div>
        </div>
        {isLoading ? (
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Loading entries…</p>
        ) : posts.length === 0 ? (
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">No entries published yet.</p>
        ) : (
          <ul className="divide-y divide-hairline border-y border-hairline">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  to="/journal/$slug"
                  params={{ slug: p.slug }}
                  className="group grid grid-cols-1 items-baseline gap-4 py-8 md:grid-cols-[120px_140px_1fr_80px] md:gap-8"
                >
                  <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground tabular-nums">
                    {formatDate(p.published_at)}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-accent">
                    {p.category ?? "Note"}
                  </span>
                  <div>
                    <h3 className="font-display text-xl tracking-[-0.02em] transition-colors group-hover:text-accent md:text-2xl">
                      {p.title}
                    </h3>
                    {p.excerpt ? (
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                    ) : null}
                  </div>
                  <span className="justify-self-start font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground md:justify-self-end">
                    Read →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
