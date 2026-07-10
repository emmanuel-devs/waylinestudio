# Wayline — Framer Rebuild Guide

A single-file playbook for recreating the Wayline site in **Framer** while keeping the exact feel of the React source: dark palette, one hot `#FE5000` accent, Lenis smooth-scroll, sticky section-tracking nav, and the signature **GSAP + SVG scroll-scrubbed wireframe city hero** where the orange dot rides a `getPointAtLength()` journey as you scroll.

Everything you need lives in this document. Copy the design tokens into Framer, paste the code overrides where indicated, and drop in the sections.

---

## 0. What you're rebuilding

One-page scroll, five sections, dark editorial palette:

1. **Hero** — pinned, scroll-scrubbed SVG wireframe city. Orange dot journeys past three signage pylons.
2. **Ethos** — 4-up disciplines grid (Plan · Design · Make · Install).
3. **Projects** — asymmetric grid of case studies, wireframe fallback covers.
4. **Journal** — dense editorial index list (date · category · title).
5. **Contact** — oversized mailto, studio address, footer.

Global: fixed nav with section-tracking active state, Lenis smooth-scroll.

---

## 1. Design system

### Palette (name these exactly in Framer › Design › Colors)

| Token               | Hex       | Use                                   |
| ------------------- | --------- | ------------------------------------- |
| `background`        | `#0A0A0A` | Page bg                               |
| `foreground`        | `#F5F5F5` | Primary text                          |
| `surface`           | `#111111` | Cards / tiles                         |
| `surface-2`         | `#1A1A1A` | Elevated                              |
| `hairline`          | `#2A2A2A` | 1px borders & dividers                |
| `muted-foreground`  | `#8A8A8A` | Eyebrows, meta                        |
| `accent`            | `#FE5000` | THE orange — used sparingly           |
| `accent-foreground` | `#0A0A0A` | Text on accent                        |

**Rule:** never introduce a second accent. Orange is the only chromatic voice.

### Typography

Load in Framer › Fonts:

- **Display** — Space Grotesk (500 weight, tracking `-0.02em` to `-0.04em` on big heads)
- **Body** — Inter (400/500)
- **Mono** — JetBrains Mono (400/500, tracking `0.18em`–`0.22em`, uppercase for eyebrows)

Set as global text styles:

- `Display / XL` — clamp(2.75rem, 7vw, 6.5rem), line-height 0.95, tracking -0.03em
- `Display / L` — clamp(2rem, 4vw, 3.5rem), line-height 1, tracking -0.03em
- `Display / M` — 2xl → 3xl, tracking -0.02em
- `Body / L` — 18–20px, line-height 1.6, `foreground/85`
- `Body / M` — 16px, line-height 1.6, `muted-foreground`
- `Mono / Eyebrow` — 11px, uppercase, tracking 0.22em, `muted-foreground`

### Rhythm

- Section padding: `py-32 md:py-48` (128 / 192 px).
- Max content width: **1400px** with `px-6 md:px-10` (24 / 40 px gutter).
- Section separators: 1px `hairline` top border, no shadows, no gradients.
- Numbering: every section eyebrow starts with `● Label / 0N` in mono.

### Grid backdrop utility (used in hero)

Add a CSS override / class:

```css
.bg-grid {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 64px 64px;
}
```

---

## 2. Framer project setup

1. New project, set page background to `#0A0A0A`.
2. Add fonts (above) and set default text color to `#F5F5F5`.
3. Site → set breakpoints Desktop 1440 / Tablet 810 / Phone 390.
4. Create **five sections** on the home page in this order and give each an **ID** (Framer: right panel › Link › Anchor ID):
   `hero`, `ethos`, `projects`, `journal`, `contact`.
5. Add a **Fixed Position** frame at the top for the nav (see §4).

The three code-driven pieces (Lenis smooth-scroll, section-tracking nav, GSAP hero) ship as **Framer Code Overrides / Code Components**. Framer supports both — use overrides for behaviors that attach to an existing frame, use code components for the whole SVG hero.

---

## 3. Smooth scroll (Lenis) — code override

Framer › Assets › Code › New Override File `SmoothScroll.tsx`.

```tsx
import type { ComponentType } from "react"
import { useEffect } from "react"

// Attach to the top-level Page frame.
export function withLenis(Component): ComponentType {
  return (props) => {
    useEffect(() => {
      if (typeof window === "undefined") return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      let lenis: any = null
      let rafId = 0
      ;(async () => {
        const Lenis = (await import("https://esm.sh/lenis@1.1.13")).default
        lenis = new Lenis({
          duration: 1.15,
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.2,
        })
        const raf = (t: number) => {
          lenis?.raf(t)
          rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)
      })()

      return () => {
        cancelAnimationFrame(rafId)
        lenis?.destroy()
      }
    }, [])
    return <Component {...props} />
  }
}
```

Apply `withLenis` to the root Page frame (right panel › Code Overrides).

---

## 4. Sticky section-tracking nav — code component

Framer › Assets › Code › New Code Component `Nav.tsx`. Insert once at the top of the page, set position **Fixed / Top**, width 100%.

```tsx
import { useEffect, useState } from "react"

const sections = [
  { id: "hero", label: "Index" },
  { id: "ethos", label: "Ethos" },
  { id: "projects", label: "Projects" },
  { id: "journal", label: "Journal" },
  { id: "contact", label: "Contact" },
]

export default function Nav() {
  const [active, setActive] = useState("hero")

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <header style={{ pointerEvents: "none", position: "fixed", inset: "0 0 auto 0", zIndex: 50 }}>
      <div style={{
        maxWidth: 1400, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "28px 40px",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        color: "#8A8A8A",
      }}>
        <a href="#hero" style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 8, color: "#F5F5F5", fontFamily: "'Space Grotesk'", letterSpacing: "0.2em" }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#FE5000" }} />
          WAYLINE
        </a>
        <nav style={{ pointerEvents: "auto", display: "flex", gap: 32 }}>
          {sections.slice(1).map((s, i) => (
            <a key={s.id} href={`#${s.id}`}
               style={{ color: active === s.id ? "#F5F5F5" : "#8A8A8A", transition: "color .2s" }}>
              <span style={{ marginRight: 8, fontVariantNumeric: "tabular-nums", color: "#6a6a6a" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.label}
            </a>
          ))}
        </nav>
        <a href="#contact" style={{ pointerEvents: "auto", color: "#F5F5F5" }}>
          Start a project →
        </a>
      </div>
    </header>
  )
}
```

**Why `rootMargin: "-45% 0px -50% 0px"`** — it collapses the observer viewport to a thin band near screen center so the active link flips exactly when a section crosses the middle, not when it first peeks in.

---

## 5. THE HERO — GSAP + SVG scroll-scrub with `getPointAtLength()`

This is the piece to get right. Framer › Assets › Code › New Code Component `Hero.tsx`. Set it as a full-viewport section, give the section anchor ID `hero`.

### The two tricks

1. **Line drawing** — for every wireframe stroke, set `strokeDasharray = strokeDashoffset = pathLength`. Animating `strokeDashoffset → 0` draws it in. GSAP tweens these together on scroll.
2. **Dot on a path** — grab an invisible `<path id="journey">`, get `journey.getTotalLength()`, then inside a scrubbed tween call `journey.getPointAtLength(len * progress)` and write `cx/cy` on the orange dot. This is what makes the dot follow the curve past the signage pylons instead of moving in a straight line.

### The timeline pattern (memorize this shape)

```txt
ScrollTrigger:
  trigger:  section
  start:    "top top"
  end:      "+=3200"      ← how long the pin lasts in scroll pixels
  scrub:    0.6           ← lag so it feels weighty, not jittery
  pin:      true
  anticipatePin: 1

Timeline (all times are positions on the same timeline, not sequential):
  0.0   camera zooms + fades in
  0.0+  each wireframe path draws (staggered i*0.05)
  0.4   hero copy fades / lifts
  0.9   dot fades in
  1.0   dot rides journey path for duration 2.4 (getPointAtLength onUpdate)
  1.3+  three signage pylons flash in (stagger 0.35)
```

### Full component

```tsx
import { useEffect, useRef } from "react"

export default function Hero() {
  const rootRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let ctx: { revert: () => void } | null = null
    let cleanup = () => {}

    ;(async () => {
      const gsapMod = await import("https://esm.sh/gsap@3.12.5")
      const stMod = await import("https://esm.sh/gsap@3.12.5/ScrollTrigger")
      const gsap = gsapMod.gsap ?? gsapMod.default
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default
      gsap.registerPlugin(ScrollTrigger)

      const svg = svgRef.current
      const root = rootRef.current
      if (!svg || !root) return

      const camera = svg.querySelector<SVGGElement>("#camera")
      const paths = Array.from(svg.querySelectorAll<SVGPathElement>("[data-draw]"))
      const dot = svg.querySelector<SVGCircleElement>("#dot")
      const dotGlow = svg.querySelector<SVGCircleElement>("#dot-glow")
      const journey = svg.querySelector<SVGPathElement>("#journey")
      const signs = Array.from(svg.querySelectorAll<SVGGElement>("[data-sign]"))
      const title = root.querySelector<HTMLElement>("[data-hero-title]")
      const sub = root.querySelector<HTMLElement>("[data-hero-sub]")

      // 1. Line-draw prep
      paths.forEach((p) => {
        const len = p.getTotalLength()
        p.style.strokeDasharray = `${len}`
        p.style.strokeDashoffset = `${len}`
      })
      const journeyLen = journey?.getTotalLength() ?? 0

      ctx = gsap.context(() => {
        if (reduced) {
          gsap.set(paths, { strokeDashoffset: 0 })
          gsap.set(signs, { opacity: 1 })
          if (dot && journey) {
            const p = journey.getPointAtLength(0)
            gsap.set(dot, { attr: { cx: p.x, cy: p.y } })
            gsap.set(dotGlow, { attr: { cx: p.x, cy: p.y } })
          }
          return
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
        })

        // Camera resolve
        tl.fromTo(camera,
          { attr: { transform: "translate(0 40) scale(0.92)" }, opacity: 0.6 },
          { attr: { transform: "translate(0 0) scale(1)" }, opacity: 1, duration: 1, ease: "power2.out" }, 0)

        // Draw wireframe (staggered)
        paths.forEach((p, i) => {
          tl.to(p, { strokeDashoffset: 0, duration: 0.9, ease: "none" }, i * 0.05)
        })

        // Copy lifts away
        if (title) tl.fromTo(title, { y: 0, opacity: 1 }, { y: -40, opacity: 0.15, duration: 1 }, 0.4)
        if (sub)   tl.fromTo(sub,   { y: 0, opacity: 0.8 }, { y: -30, opacity: 0, duration: 0.8 }, 0.4)

        // THE DOT — getPointAtLength scrub
        if (dot && dotGlow && journey) {
          gsap.set([dot, dotGlow], { opacity: 0 })
          tl.to([dot, dotGlow], { opacity: 1, duration: 0.2 }, 0.9)
          tl.to({}, {
            duration: 2.4,
            ease: "none",
            onUpdate: function () {
              const p = journey.getPointAtLength(journeyLen * this.progress())
              dot.setAttribute("cx", `${p.x}`)
              dot.setAttribute("cy", `${p.y}`)
              dotGlow.setAttribute("cx", `${p.x}`)
              dotGlow.setAttribute("cy", `${p.y}`)
            },
          }, 1)
        }

        // Signage pylons light up as dot passes
        signs.forEach((s, i) => {
          tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 1.3 + i * 0.35)
        })
      }, root)

      cleanup = () => ScrollTrigger.getAll().forEach((t: any) => t.kill())
    })()

    return () => { cleanup(); ctx?.revert() }
  }, [])

  return (
    <section ref={rootRef} id="hero"
      style={{ position: "relative", height: "100vh", width: "100%", overflow: "hidden", background: "#0A0A0A" }}>
      <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.6, pointerEvents: "none" }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 60%, transparent 0%, #0A0A0A 75%)",
      }} />

      <svg ref={svgRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <filter id="dotBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <g id="camera">
          {/* Ground plane grid */}
          <g stroke="#242424" strokeWidth="1" fill="none" opacity="0.7">
            {Array.from({ length: 18 }).map((_, i) => (
              <path key={`h${i}`} data-draw d={`M 0 ${520 + i * 22} L 1600 ${520 + i * 22}`} />
            ))}
            {Array.from({ length: 24 }).map((_, i) => {
              const x = i * 70 - 200
              return <path key={`v${i}`} data-draw d={`M ${x} 520 L ${x + 400} 900`} />
            })}
          </g>

          {/* Wireframe skyline — full geometry */}
          <g stroke="#3a3a3a" strokeWidth="1.25" fill="none">
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

            <path data-draw d="M 1180 520 L 1180 300 L 1260 300 L 1260 520" />
            <path data-draw d="M 1180 340 L 1260 340 M 1180 380 L 1260 380 M 1180 420 L 1260 420 M 1180 460 L 1260 460 M 1180 500 L 1260 500" />
            <path data-draw d="M 1220 300 L 1220 520" />
            <path data-draw d="M 1280 520 L 1280 220 L 1360 220 L 1360 520" />
            <path data-draw d="M 1280 260 L 1360 260 M 1280 300 L 1360 300 M 1280 340 L 1360 340 M 1280 380 L 1360 380 M 1280 420 L 1360 420 M 1280 460 L 1360 460 M 1280 500 L 1360 500" />
            <path data-draw d="M 1320 220 L 1320 520" />
            <path data-draw d="M 1380 520 L 1380 400 L 1460 400 L 1460 520" />
            <path data-draw d="M 1380 440 L 1460 440 M 1380 480 L 1460 480" />
          </g>

          {/* Transit lines */}
          <g stroke="#2a2a2a" strokeWidth="1" fill="none" strokeDasharray="4 6" opacity="0.9">
            <path data-draw d="M 100 640 Q 500 600 900 660 T 1500 640" />
            <path data-draw d="M 100 720 Q 400 780 800 740 T 1500 760" />
          </g>

          {/* THE JOURNEY — invisible curve the dot rides */}
          <path id="journey"
            d="M 200 660 C 380 640 520 700 720 680 S 980 620 1120 700 S 1360 780 1420 700 S 1300 560 1080 620 S 800 720 560 700 S 300 760 200 660 Z"
            fill="none" stroke="#fe5000" strokeWidth="1.25" strokeDasharray="2 6" opacity="0.35" data-draw />

          {/* Signage pylons */}
          <g stroke="#fe5000" strokeWidth="1.4" fill="none">
            <g data-sign opacity="0">
              <path d="M 520 690 L 520 640" />
              <rect x="500" y="600" width="60" height="40" />
              <path d="M 508 615 L 552 615 M 508 625 L 540 625" strokeWidth="1" />
            </g>
            <g data-sign opacity="0">
              <path d="M 900 660 L 900 610" />
              <rect x="880" y="570" width="60" height="40" />
              <path d="M 888 585 L 932 585 M 888 595 L 920 595" strokeWidth="1" />
            </g>
            <g data-sign opacity="0">
              <path d="M 1240 700 L 1240 650" />
              <rect x="1220" y="610" width="60" height="40" />
              <path d="M 1228 625 L 1272 625 M 1228 635 L 1260 635" strokeWidth="1" />
            </g>
          </g>

          {/* Origin station marker */}
          <g stroke="#f5f5f5" strokeWidth="1.2" fill="none" opacity="0.9">
            <circle cx="200" cy="660" r="10" />
            <path d="M 190 660 L 210 660 M 200 650 L 200 670" />
          </g>

          {/* The orange dot */}
          <circle id="dot-glow" cx="200" cy="660" r="14" fill="#fe5000" opacity="0.4" filter="url(#dotBlur)" />
          <circle id="dot" cx="200" cy="660" r="5" fill="#fe5000" />
        </g>
      </svg>

      {/* Hero copy overlay */}
      <div style={{
        position: "relative", zIndex: 10, maxWidth: 1400, margin: "0 auto",
        height: "100%", padding: "160px 40px 56px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div style={{ maxWidth: 780 }}>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A8A8A" }}>
            <span style={{ color: "#FE5000" }}>●</span> Wayfinding Studio — Est. 2011
          </p>
          <h1 data-hero-title style={{
            marginTop: 32, fontFamily: "'Space Grotesk'", fontWeight: 500,
            fontSize: "clamp(2.75rem, 7vw, 6.5rem)", lineHeight: 0.95, letterSpacing: "-0.03em", color: "#F5F5F5",
          }}>
            Guiding people<br />through the<br />
            <span style={{ color: "#FE5000" }}>public world.</span>
          </h1>
          <p data-hero-sub style={{ marginTop: 32, maxWidth: 560, fontSize: 18, lineHeight: 1.6, color: "#8A8A8A" }}>
            We plan how people move through airports, stations and precincts —
            then design, make and install the signage that guides them.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8A8A8A" }}>
          <span>Scroll to enter</span>
          <span>LDN · 51.5074° N / 0.1278° W</span>
        </div>
      </div>
    </section>
  )
}
```

### If you tweak anything, keep these invariants

- Every stroke you want to draw in **must** have `data-draw` and a real length (no `fill`, has `stroke`).
- The dot animation is `duration: 2.4` on an **empty tween** whose `onUpdate` writes attributes — do not try to tween `cx/cy` directly on the path. `getPointAtLength` is the whole point.
- `pin: true` + `end: "+=3200"` means the section holds for 3200px of scroll. Shorter = faster hero, longer = slower.
- `scrub: 0.6` is the weight. Try 0.3 (snappier) or 1.2 (slower) but never `true` (feels twitchy).
- Wrap everything in `gsap.context(() => { … }, root)` so `ctx.revert()` in the cleanup nukes every tween/ScrollTrigger. Missing this = duplicated triggers on route changes.
- Always branch on `prefers-reduced-motion` and set the finished state without the timeline.

---

## 6. Ethos section

Anchor ID `ethos`. Build in Framer as a plain layout.

- Eyebrow `● Ethos / 01`
- Big head `Legible / by design.` — Display L.
- Right column: intro paragraph + smaller muted paragraph.
- Below: 4 columns divided by 1px hairline dividers.
- Cards: mono number top-left, tiny orange dot top-right (opacity 0 → 1 on hover), title `Display M`, one line of body.
- On card hover: bg shifts to `surface`. Nothing else moves.

```txt
01 Plan     — Movement studies, sightlines, information architecture.
02 Design   — Typography, iconography, system rules across a whole environment.
03 Make     — Prototyping, fabrication, materials, lighting.
04 Install  — Site delivery, wayfinding audits, post-occupancy tuning.
```

---

## 7. Projects section

Anchor ID `projects`.

- Eyebrow `● Selected work / 02`, head `Systems in / public space.`
- 12-col grid. Tiles use an **asymmetric span pattern**: `8, 4, 5, 7` repeating.
- Each tile: `aspect-4/3` cover, hairline border, on-hover: orange border, image scales `1.03`, a small `View case study →` label fades in over a bottom gradient.
- Below the cover: 2-line title + meta (`NN / Client`, year, location, disciplines list in mono).
- Fallback wireframe cover (used when no image): dark radial rect, 20 horizontal + 26 vertical hairline lines, then a small orange framed sign glyph in the center — visual DNA link to the hero.

For a Framer CMS setup, model Projects as a collection: `title, slug, client, year, location, cover, disciplines[]`. Bind the tile to the collection and Framer generates the grid.

---

## 8. Journal section

Anchor ID `journal`.

- Eyebrow `● Journal / 03`, head `Notes from / the studio.`
- Editorial index: `<ul>` with hairline top+bottom borders and dividers between rows.
- Row grid columns: `120px | 140px | 1fr | 80px` — date (mono, tabular-nums) · category (mono, orange) · title + one-line excerpt · `Read →`.
- Hover: title only changes color to accent. No motion, no scale.
- Date format: `YYYY.MM.DD` — always use `tabular-nums` for alignment.

---

## 9. Contact section

Anchor ID `contact`.

- Eyebrow `● Contact / 04`.
- Oversized mailto link — `clamp(2.75rem, 9vw, 9rem)`, line-height 0.95, tracking -0.04em. Two lines: `studio@` / `wayline.co.` (final full stop is orange). Hover flips the whole link to accent.
- Below: 3 columns — Studio address · New enquiries · Elsewhere.
- Footer: 1px hairline top, mono row: `© Wayline Studio — MMXXV` left, `All systems operational ●` right.

---

## 10. Rebuild playbook (do this in order)

1. Import fonts + register the 8 color tokens.
2. Build empty page shell with the 5 anchor-ID'd sections.
3. Drop in the `Nav` code component, apply `withLenis` override to the page.
4. Build **Hero** section: paste the `Hero` code component, set full-viewport, verify pin works (scroll ~3 full page-heights before the next section appears).
5. Build Ethos → Projects → Journal → Contact using the standard section rhythm (`● Label / 0N` eyebrow → giant head with `<br />` → content grid → hairline separators).
6. Do the details pass: `tabular-nums` on every number, `tracking-[0.18em–0.22em]` on every mono label, hover states restricted to color/opacity only.

---

## 11. Editorial polish checklist

- One accent color, everywhere. If you feel like adding a second, don't.
- Every eyebrow: `● Label / 0N` in mono, `0.22em` tracking, `#8A8A8A`.
- Every section separator: 1px `#2A2A2A` top border. No shadows.
- Numbers: `font-variant-numeric: tabular-nums` — dates, years, list indices.
- Big heads always have a `<br />` line break — controlled ragging, not auto-wrap.
- Hover = color/opacity change. Never scale text, never move body copy.
- Reduced-motion path: hero resolves to its final state instantly; Lenis short-circuits; nothing else animates.

That's the whole system. The hero's timeline pattern (`pin + scrub` timeline with staggered `strokeDashoffset` draws, `getPointAtLength` dot ride, then signage flashes) is the signature move — everything else is disciplined editorial layout in dark grey with one orange voice.
