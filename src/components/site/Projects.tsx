import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  PROJECTS_QUERY,
  sanity,
  urlFor,
  type SanityProject,
} from "@/lib/sanity";

const SPANS = ["md:col-span-8", "md:col-span-4", "md:col-span-5", "md:col-span-7"];

function WireframeCover({ n }: { n: string }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.03]"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={`g-${n}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#151515" />
          <stop offset="1" stopColor="#0a0a0a" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#g-${n})`} />
      {Array.from({ length: 20 }).map((_, i) => (
        <line key={i} x1="0" y1={i * 30} x2="800" y2={i * 30} stroke="#242424" strokeWidth="1" />
      ))}
      {Array.from({ length: 26 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 32} y1="0" x2={i * 32} y2="600" stroke="#1e1e1e" strokeWidth="1" />
      ))}
      <g stroke="#fe5000" strokeWidth="1.5" fill="none" opacity="0.9">
        <rect x="320" y="200" width="200" height="80" />
        <path d="M 340 225 L 500 225 M 340 245 L 470 245 M 340 265 L 440 265" />
        <path d="M 420 280 L 420 380" />
        <circle cx="420" cy="400" r="6" fill="#fe5000" />
      </g>
    </svg>
  );
}

function ProjectTile({ p, index }: { p: SanityProject; index: number }) {
  const n = String(index + 1).padStart(2, "0");
  const span = SPANS[index % SPANS.length];
  const coverUrl = p.cover ? urlFor(p.cover).width(1200).height(900).fit("crop").auto("format").url() : null;

  return (
    <article className={`group relative ${span} border-hairline hover:border-accent/50 transition-colors`}>
      <Link
        to="/projects/$slug"
        params={{ slug: p.slug.current }}
        className="block"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-hairline bg-surface">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={p.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <WireframeCover n={n} />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent">
              View case study →
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              {n} / {p.client ?? "Confidential"}
            </p>
            <h3 className="mt-2 font-display text-xl leading-[1.15] tracking-[-0.02em] md:text-2xl">
              {p.title}
            </h3>
          </div>
          <div className="shrink-0 text-right font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
            {p.year ?? "—"}
            <br />
            <span className="text-foreground/60">{p.location ?? ""}</span>
          </div>
        </div>
        {p.disciplines?.length ? (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground/80">
            {p.disciplines.map((d) => (
              <span key={d}>— {d}</span>
            ))}
          </div>
        ) : null}
      </Link>
    </article>
  );
}

export function Projects() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => sanity.fetch<SanityProject[]>(PROJECTS_QUERY),
  });

  return (
    <section id="projects" className="relative border-t border-hairline bg-background py-32 md:py-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-20 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              <span className="text-accent">●</span> Selected work / 02
            </p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
              Systems in <br /> public space.
            </h2>
          </div>
        </div>

        {isLoading ? (
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
            Loading index…
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-x-8 md:gap-y-24">
            {projects.map((p, i) => (
              <ProjectTile key={p._id} p={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
