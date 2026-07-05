const posts = [
  {
    date: "2024.11.02",
    category: "Field notes",
    title: "The quiet grammar of transit signage",
    dek: "Why the best wayfinding systems whisper rather than shout — and what airports keep getting wrong.",
    read: "6 min",
  },
  {
    date: "2024.09.18",
    category: "Case study",
    title: "Designing for a million footfalls a year",
    dek: "Behind the four-year rebuild of a European interchange, and the small decisions that carried the load.",
    read: "9 min",
  },
  {
    date: "2024.07.24",
    category: "Essay",
    title: "Pictograms don't translate. People do.",
    dek: "Notes on running language research across three continents before drawing a single symbol.",
    read: "4 min",
  },
];

export function Journal() {
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
          <a
            href="#"
            className="hidden font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground transition-colors hover:text-accent md:block"
          >
            All entries →
          </a>
        </div>

        <ul className="divide-y divide-hairline border-y border-hairline">
          {posts.map((p) => (
            <li key={p.title}>
              <a
                href="#"
                className="group grid grid-cols-1 items-baseline gap-4 py-8 md:grid-cols-[120px_140px_1fr_80px] md:gap-8"
              >
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground tabular-nums">
                  {p.date}
                </span>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-accent">
                  {p.category}
                </span>
                <div>
                  <h3 className="font-display text-xl tracking-[-0.02em] transition-colors group-hover:text-accent md:text-2xl">
                    {p.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {p.dek}
                  </p>
                </div>
                <span className="justify-self-start font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground md:justify-self-end">
                  {p.read} →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
