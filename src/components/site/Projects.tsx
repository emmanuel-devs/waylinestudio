const projects = [
  {
    n: "01",
    title: "Heathrow Terminal 2 — Interchange",
    client: "Heathrow Airports Ltd.",
    location: "London, UK",
    year: "2024",
    disciplines: ["Wayfinding strategy", "Signage design", "Fabrication"],
    span: "md:col-span-8",
  },
  {
    n: "02",
    title: "King's Cross Precinct Rewayfinding",
    client: "Argent LLP",
    location: "London, UK",
    year: "2023",
    disciplines: ["Movement study", "Environmental graphics"],
    span: "md:col-span-4",
  },
  {
    n: "03",
    title: "Zaha Hadid — Napoli Afragola",
    client: "Rete Ferroviaria Italiana",
    location: "Naples, IT",
    year: "2023",
    disciplines: ["Signage system", "Install"],
    span: "md:col-span-5",
  },
  {
    n: "04",
    title: "Tate Modern — Blavatnik Extension",
    client: "Tate",
    location: "London, UK",
    year: "2022",
    disciplines: ["Cultural wayfinding", "Typography"],
    span: "md:col-span-7",
  },
];

function ProjectTile({ p }: { p: (typeof projects)[number] }) {
  return (
    <article
      className={`group relative ${p.span} border-hairline hover:border-accent/50 transition-colors`}
    >
      <a href="#" className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-hairline bg-surface">
          {/* Abstract wireframe placeholder — replaced by CMS imagery */}
          <svg
            className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.03]"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            <defs>
              <linearGradient id={`g-${p.n}`} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#151515" />
                <stop offset="1" stopColor="#0a0a0a" />
              </linearGradient>
            </defs>
            <rect width="800" height="600" fill={`url(#g-${p.n})`} />
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={i * 30}
                x2="800"
                y2={i * 30}
                stroke="#242424"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 26 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 32}
                y1="0"
                x2={i * 32}
                y2="600"
                stroke="#1e1e1e"
                strokeWidth="1"
              />
            ))}
            {/* signage shape */}
            <g stroke="#fe5000" strokeWidth="1.5" fill="none" opacity="0.9">
              <rect x="320" y="200" width="200" height="80" />
              <path d="M 340 225 L 500 225 M 340 245 L 470 245 M 340 265 L 440 265" />
              <path d="M 420 280 L 420 380" />
              <circle cx="420" cy="400" r="6" fill="#fe5000" />
            </g>
          </svg>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent">
              View case study →
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              {p.n} / {p.client}
            </p>
            <h3 className="mt-2 font-display text-xl leading-[1.15] tracking-[-0.02em] md:text-2xl">
              {p.title}
            </h3>
          </div>
          <div className="shrink-0 text-right font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
            {p.year}
            <br />
            <span className="text-foreground/60">{p.location}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground/80">
          {p.disciplines.map((d) => (
            <span key={d}>— {d}</span>
          ))}
        </div>
      </a>
    </article>
  );
}

export function Projects() {
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
          <a
            href="#"
            className="hidden font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground transition-colors hover:text-accent md:block"
          >
            Full index →
          </a>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-x-8 md:gap-y-24">
          {projects.map((p) => (
            <ProjectTile key={p.n} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
