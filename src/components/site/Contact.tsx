export function Contact() {
  return (
    <section id="contact" className="relative border-t border-hairline bg-background py-32 md:py-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
          <span className="text-accent">●</span> Contact / 04
        </p>

        <a
          href="mailto:studio@wayline.co"
          className="mt-10 block font-display text-[clamp(2.75rem,9vw,9rem)] leading-[0.95] tracking-[-0.04em] transition-colors hover:text-accent"
        >
          studio@ <br />
          wayline.co<span className="text-accent">.</span>
        </a>

        <div className="mt-24 grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              Studio
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/85">
              48 Hoxton Square
              <br />
              London N1 6PB
              <br />
              United Kingdom
            </p>
          </div>
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              New enquiries
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/85">
              studio@wayline.co
              <br />
              +44 (0)20 7946 0000
            </p>
          </div>
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              Elsewhere
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground/85">
              <li><a href="#" className="hover:text-accent">Instagram, ↗</a></li>
              <li><a href="#" className="hover:text-accent">LinkedIn, ↗</a></li>
              <li><a href="#" className="hover:text-accent">Are.na, ↗</a></li>
            </ul>
          </div>
        </div>

        <footer className="mt-32 flex flex-col justify-between gap-4 border-t border-hairline pt-8 font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground md:flex-row">
          <span>© Wayline Studio — MMXXV</span>
          <span>All systems operational <span className="text-accent">●</span></span>
        </footer>
      </div>
    </section>
  );
}
