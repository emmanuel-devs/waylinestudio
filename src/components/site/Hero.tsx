import { useEffect, useRef } from "react";

/**
 * Scroll-scrubbed wireframe city hero.
 * The orange dot leaves the station, traces the transit lines, pauses
 * at signage pylons, and completes a loop back home — all driven by
 * page scroll via GSAP ScrollTrigger.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ctx: { revert: () => void } | null = null;
    let cleanup = () => {};

    (async () => {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      const gsap = gsapMod.gsap ?? gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      const svg = svgRef.current;
      const root = rootRef.current;
      if (!svg || !root) return;

      const camera = svg.querySelector<SVGGElement>("#camera");
      const paths = Array.from(svg.querySelectorAll<SVGPathElement>("[data-draw]"));
      const dot = svg.querySelector<SVGCircleElement>("#dot");
      const dotGlow = svg.querySelector<SVGCircleElement>("#dot-glow");
      const journey = svg.querySelector<SVGPathElement>("#journey");
      const signs = Array.from(svg.querySelectorAll<SVGGElement>("[data-sign]"));
      const title = root.querySelector<HTMLElement>("[data-hero-title]");
      const sub = root.querySelector<HTMLElement>("[data-hero-sub]");
      const meta = root.querySelector<HTMLElement>("[data-hero-meta]");

      // Prep line drawing
      paths.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });

      const journeyLen = journey?.getTotalLength() ?? 0;

      ctx = gsap.context(() => {
        if (reduced) {
          // Static resolved state, no scrub
          gsap.set(paths, { strokeDashoffset: 0 });
          gsap.set(signs, { opacity: 1 });
          if (dot && journey) {
            const p = journey.getPointAtLength(0);
            gsap.set(dot, { attr: { cx: p.x, cy: p.y } });
            gsap.set(dotGlow, { attr: { cx: p.x, cy: p.y } });
          }
          return;
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=3200",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
          },
        });

        // 1. Camera zoom-in as skyline resolves
        tl.fromTo(
          camera,
          { attr: { transform: "translate(0 40) scale(0.92)" }, opacity: 0.6 },
          { attr: { transform: "translate(0 0) scale(1)" }, opacity: 1, duration: 1, ease: "power2.out" },
          0,
        );

        // 2. Draw skyline + streets progressively
        paths.forEach((p, i) => {
          tl.to(
            p,
            { strokeDashoffset: 0, duration: 0.9, ease: "none" },
            i * 0.05,
          );
        });

        // 3. Copy fades
        if (title) tl.fromTo(title, { y: 0, opacity: 1 }, { y: -40, opacity: 0.15, duration: 1 }, 0.4);
        if (sub) tl.fromTo(sub, { y: 0, opacity: 0.8 }, { y: -30, opacity: 0, duration: 0.8 }, 0.4);
        if (meta) tl.fromTo(meta, { opacity: 0.6 }, { opacity: 0, duration: 0.6 }, 0.5);

        // 4. Dot travels the journey path
        if (dot && dotGlow && journey) {
          gsap.set([dot, dotGlow], { opacity: 0 });
          tl.to([dot, dotGlow], { opacity: 1, duration: 0.2 }, 0.9);
          tl.to(
            {},
            {
              duration: 2.4,
              ease: "none",
              onUpdate: function () {
                const p = journey.getPointAtLength(journeyLen * this.progress());
                dot.setAttribute("cx", `${p.x}`);
                dot.setAttribute("cy", `${p.y}`);
                dotGlow.setAttribute("cx", `${p.x}`);
                dotGlow.setAttribute("cy", `${p.y}`);
              },
            },
            1,
          );
        }

        // 5. Signage pylons light up in sequence
        signs.forEach((s, i) => {
          tl.fromTo(
            s,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: "power1.out" },
            1.3 + i * 0.35,
          );
        });
      }, root);

      cleanup = () => {
        ScrollTrigger.getAll().forEach((t: { kill: () => void }) => t.kill());
      };
    })();

    return () => {
      cleanup();
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-background"
    >
      {/* Subtle grid backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, transparent 0%, #0a0a0a 75%)",
        }}
        aria-hidden
      />

      {/* SVG city */}
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <filter id="dotBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <g id="camera">
          {/* Ground plane grid */}
          <g stroke="#242424" strokeWidth="1" fill="none" opacity="0.7">
            {Array.from({ length: 18 }).map((_, i) => (
              <path
                key={`h${i}`}
                data-draw
                d={`M 0 ${520 + i * 22} L 1600 ${520 + i * 22}`}
              />
            ))}
            {Array.from({ length: 24 }).map((_, i) => {
              const x = i * 70 - 200;
              return (
                <path
                  key={`v${i}`}
                  data-draw
                  d={`M ${x} 520 L ${x + 400} 900`}
                />
              );
            })}
          </g>

          {/* Skyline buildings — wireframe */}
          <g stroke="#3a3a3a" strokeWidth="1.25" fill="none">
            {/* Left cluster */}
            <path data-draw d="M 120 520 L 120 320 L 200 320 L 200 520" />
            <path data-draw d="M 120 360 L 200 360 M 120 400 L 200 400 M 120 440 L 200 440 M 120 480 L 200 480" />
            <path data-draw d="M 160 320 L 160 520" />

            <path data-draw d="M 220 520 L 220 240 L 300 240 L 300 520" />
            <path data-draw d="M 220 280 L 300 280 M 220 320 L 300 320 M 220 360 L 300 360 M 220 400 L 300 400 M 220 440 L 300 440 M 220 480 L 300 480" />
            <path data-draw d="M 260 240 L 260 520" />

            <path data-draw d="M 320 520 L 320 380 L 400 380 L 400 520" />
            <path data-draw d="M 320 420 L 400 420 M 320 460 L 400 460 M 320 500 L 400 500" />

            {/* Center tower */}
            <path data-draw d="M 720 520 L 720 140 L 820 140 L 820 520" />
            <path data-draw d="M 720 180 L 820 180 M 720 220 L 820 220 M 720 260 L 820 260 M 720 300 L 820 300 M 720 340 L 820 340 M 720 380 L 820 380 M 720 420 L 820 420 M 720 460 L 820 460 M 720 500 L 820 500" />
            <path data-draw d="M 770 140 L 770 520" />
            <path data-draw d="M 745 140 L 745 520 M 795 140 L 795 520" />
            <path data-draw d="M 745 140 L 720 100 L 820 100 L 795 140" />

            <path data-draw d="M 840 520 L 840 260 L 920 260 L 920 520" />
            <path data-draw d="M 840 300 L 920 300 M 840 340 L 920 340 M 840 380 L 920 380 M 840 420 L 920 420 M 840 460 L 920 460 M 840 500 L 920 500" />
            <path data-draw d="M 880 260 L 880 520" />

            <path data-draw d="M 940 520 L 940 340 L 1020 340 L 1020 520" />
            <path data-draw d="M 940 380 L 1020 380 M 940 420 L 1020 420 M 940 460 L 1020 460 M 940 500 L 1020 500" />

            {/* Right cluster */}
            <path data-draw d="M 1180 520 L 1180 300 L 1260 300 L 1260 520" />
            <path data-draw d="M 1180 340 L 1260 340 M 1180 380 L 1260 380 M 1180 420 L 1260 420 M 1180 460 L 1260 460 M 1180 500 L 1260 500" />
            <path data-draw d="M 1220 300 L 1220 520" />

            <path data-draw d="M 1280 520 L 1280 220 L 1360 220 L 1360 520" />
            <path data-draw d="M 1280 260 L 1360 260 M 1280 300 L 1360 300 M 1280 340 L 1360 340 M 1280 380 L 1360 380 M 1280 420 L 1360 420 M 1280 460 L 1360 460 M 1280 500 L 1360 500" />
            <path data-draw d="M 1320 220 L 1320 520" />

            <path data-draw d="M 1380 520 L 1380 400 L 1460 400 L 1460 520" />
            <path data-draw d="M 1380 440 L 1460 440 M 1380 480 L 1460 480" />
          </g>

          {/* Transit lines — subtle */}
          <g stroke="#2a2a2a" strokeWidth="1" fill="none" strokeDasharray="4 6" opacity="0.9">
            <path data-draw d="M 100 640 Q 500 600 900 660 T 1500 640" />
            <path data-draw d="M 100 720 Q 400 780 800 740 T 1500 760" />
          </g>

          {/* Journey path the dot travels */}
          <path
            id="journey"
            d="M 200 660 C 380 640 520 700 720 680 S 980 620 1120 700 S 1360 780 1420 700 S 1300 560 1080 620 S 800 720 560 700 S 300 760 200 660 Z"
            fill="none"
            stroke="#fe5000"
            strokeWidth="1.25"
            strokeDasharray="2 6"
            opacity="0.35"
            data-draw
          />

          {/* Signage pylons */}
          <g stroke="#fe5000" strokeWidth="1.4" fill="none">
            <g data-sign opacity="0">
              <path d="M 520 690 L 520 640" />
              <rect x="500" y="600" width="60" height="40" />
              <path d="M 508 615 L 552 615 M 508 625 L 540 625" stroke="#fe5000" strokeWidth="1" />
            </g>
            <g data-sign opacity="0">
              <path d="M 900 660 L 900 610" />
              <rect x="880" y="570" width="60" height="40" />
              <path d="M 888 585 L 932 585 M 888 595 L 920 595" stroke="#fe5000" strokeWidth="1" />
            </g>
            <g data-sign opacity="0">
              <path d="M 1240 700 L 1240 650" />
              <rect x="1220" y="610" width="60" height="40" />
              <path d="M 1228 625 L 1272 625 M 1228 635 L 1260 635" stroke="#fe5000" strokeWidth="1" />
            </g>
          </g>

          {/* Origin — train station marker */}
          <g stroke="#f5f5f5" strokeWidth="1.2" fill="none" opacity="0.9">
            <circle cx="200" cy="660" r="10" />
            <path d="M 190 660 L 210 660 M 200 650 L 200 670" />
          </g>

          {/* The orange dot */}
          <circle
            id="dot-glow"
            cx="200"
            cy="660"
            r="14"
            fill="#fe5000"
            opacity="0.4"
            filter="url(#dotBlur)"
          />
          <circle id="dot" cx="200" cy="660" r="5" fill="#fe5000" />
        </g>
      </svg>

      {/* Hero copy overlay */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-between px-6 pt-32 pb-10 md:px-10 md:pt-40 md:pb-14">
        <div className="max-w-3xl">
          <p
            data-hero-meta
            className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground"
          >
            <span className="text-accent">●</span> Wayfinding Studio — Est. 2011
          </p>
          <h1
            data-hero-title
            className="mt-8 font-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.03em]"
          >
            Guiding people
            <br />
            through the
            <br />
            <span className="text-accent">public world.</span>
          </h1>
          <p
            data-hero-sub
            className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            We plan how people move through airports, stations and precincts —
            then design, make and install the signage that guides them.
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
            <span className="inline-block h-3 w-px bg-muted-foreground/50" />
            Scroll to enter
          </div>
          <div className="hidden font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground md:block">
            LDN · 51.5074° N &nbsp;/&nbsp; 0.1278° W
          </div>
        </div>
      </div>
    </section>
  );
}
