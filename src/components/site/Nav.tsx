import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "Index" },
  { id: "ethos", label: "Ethos" },
  { id: "projects", label: "Projects" },
  { id: "journal", label: "Journal" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10 md:py-7">
        <a
          href="#hero"
          className="pointer-events-auto flex items-center gap-2 font-display text-sm tracking-[0.2em] uppercase"
        >
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
          Wayline
        </a>
        <nav className="pointer-events-auto hidden md:block">
          <ul className="flex items-center gap-8 font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
            {sections.slice(1).map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`transition-colors hover:text-foreground ${
                    active === s.id ? "text-foreground" : ""
                  }`}
                >
                  <span className="mr-2 tabular-nums text-muted-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href="#contact"
          className="pointer-events-auto group flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase"
        >
          <span className="hidden sm:inline">Start a project</span>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-hairline transition-colors group-hover:border-accent group-hover:text-accent">
            →
          </span>
        </a>
      </div>
    </header>
  );
}
