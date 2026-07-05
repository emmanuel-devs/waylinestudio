const disciplines = [
  { n: "01", t: "Plan", d: "Movement studies, sightlines and information architecture for entire precincts." },
  { n: "02", t: "Design", d: "Typography, iconography and system rules that scale across a whole environment." },
  { n: "03", t: "Make", d: "Prototyping, fabrication, materials and lighting — engineered for public life." },
  { n: "04", t: "Install", d: "Site delivery, wayfinding audits and post-occupancy tuning after opening day." },
];

export function Ethos() {
  return (
    <section id="ethos" className="relative border-t border-hairline bg-background py-32 md:py-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              <span className="text-accent">●</span> Ethos / 01
            </p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
              Legible <br /> by design.
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="max-w-2xl text-lg leading-relaxed text-foreground/85 md:text-xl">
              A great wayfinding system disappears. Visitors arrive with a task,
              and the environment answers it — quietly, at the right moment, in
              the right language. We work with architects, transport authorities
              and cultural institutions to build systems that hold up under a
              million footfalls a year.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              From first movement study to the last fixed sign, our team owns
              the full arc. No hand-offs. No dropped intent.
            </p>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-px overflow-hidden border-y border-hairline sm:grid-cols-2 md:grid-cols-4">
          {disciplines.map((d) => (
            <div
              key={d.n}
              className="group relative bg-background p-8 transition-colors hover:bg-surface"
            >
              <div className="pointer-events-none absolute inset-y-0 -left-px w-px bg-hairline sm:block" aria-hidden />
              <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
                <span>{d.n}</span>
                <span className="h-1 w-1 rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mt-14 font-display text-2xl tracking-[-0.02em] md:text-3xl">
                {d.t}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {d.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
