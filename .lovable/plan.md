
# Premium Wayfinding Studio — One-Page Scroll Site

A dark, minimal, high-end one-pager anchored by a scroll-scrubbed SVG wireframe city hero. Built on TanStack Start (faster and more flexible than Webflow/Framer), with Sanity CMS so the client's team edits Projects and Blog via a form-based Studio, no developer required.

## Concept (the scroll story)

A wireframe city resolves out of black. As you scroll, the camera zooms in; an orange dot (#FE5000) leaves the train station, follows a bus line across the grid, walks a segment, pauses at illuminated signage pylons, then completes a cycle loop back to the station. Section anchors (Ethos, Projects, Blog, Contact) are triggered as the dot arrives at each waypoint — the journey IS the navigation.

## Tech choice — and why not Webflow/Framer

- **TanStack Start + GSAP ScrollTrigger + Sanity.** Framer's scroll scrubbing chokes on complex SVG choreography; Webflow's interactions can't sequence this cleanly without hacks. A hand-built GSAP timeline gives frame-accurate control, tiny payload (vector, not image sequence), and perfect crispness on any display. Sanity Studio gives the client a better editing UX than either platform's CMS, fully white-labelable.
- **Hero engine: SVG + GSAP ScrollTrigger** (not frame-sequence PNGs, not Three.js). Vector wireframes match the brief's "abstract linework" language, stay razor-sharp, weigh <100KB vs 10MB+ for a frame sequence, and animate at 60fps on mobile. Mobile fallback: shorter timeline, reduced path count, `prefers-reduced-motion` respected.

## Sections (single continuous scroll)

1. **Hero** — full-viewport SVG wireframe city, scroll-pinned. Studio wordmark fades in over the animation. Scroll cue at bottom.
2. **Ethos** — split typographic layout. Oversized display type, thin rules, three-column "Plan · Design · Make · Install" process strip. One orange accent line animates on scroll-into-view.
3. **Projects** — CMS-driven. Large asymmetric case-study cards with hover reveal (project name, location, discipline). Clicking opens a lightweight modal detail (stays on-page — one-page contract preserved) or a dedicated `/projects/$slug` route for shareability.
4. **Blog** — CMS-driven, light treatment. Editorial list: date · category · title · 1-line dek. Individual posts at `/journal/$slug`.
5. **Contact** — Large mailto CTA, studio address, minimal form (name / company / message) posting to a server function that emails the studio.

Sticky minimal nav (dot + section labels) tracks scroll position.

## Design system

- **Palette:** near-black `#0A0A0A` background, graphite `#151515`, mid-grey `#2A2A2A`, hairline `#3A3A3A`, off-white `#F5F5F5` text, single accent orange `#FE5000`.
- **Type:** Display — **Neue Haas Grotesk Display** substitute via `Inter Display` or `Space Grotesk` (tight tracking, weight 500). Body — `Inter` (weight 400, generous leading). Numerals tabular.
- **Motion:** GSAP + Lenis for smooth scroll. Micro-interactions: hairline underlines, orange dot cursor on hover over links, staggered fade-ups on section entry. Everything respects `prefers-reduced-motion`.
- **Imagery:** No stock. Project imagery comes from CMS (client's real photography). Everywhere else: SVG linework only.

## CMS — Sanity

- Schemas: `project` (title, slug, client, location, year, disciplines[], hero image, gallery, body, order) and `post` (title, slug, publishedAt, category, excerpt, cover, body PortableText).
- Sanity Studio hosted (sanity.io/manage), branded with studio's logo, editors invited by email. Free tier is more than enough.
- Frontend fetches with `@sanity/client` + `@sanity/image-url` inside route loaders. CORS origin added via Sanity MCP.

## SEO & performance

- Route `head()` with title, description, og:title/description/image, twitter card, JSON-LD (`Organization` + `CreativeWork` per project).
- Semantic HTML, single H1 per section, alt text on all CMS images.
- SVG hero preloaded; fonts self-hosted via `@fontsource`; images served through Sanity's CDN with responsive `srcset`.
- Target Lighthouse 95+ on desktop, 90+ on mobile.

## Build order

1. Design tokens, typography, root layout, sticky nav shell.
2. Sanity schemas + Studio + CORS wiring.
3. Ethos, Projects (with CMS), Blog (with CMS), Contact sections — get the page shape right first.
4. Hero SVG artwork + GSAP scroll timeline (the hero deserves dedicated focus once the frame around it is solid).
5. Mobile choreography + reduced-motion fallback.
6. SEO metadata, JSON-LD, sitemap, robots.
7. Polish pass: cursor, micro-interactions, contact form server function.

## Technical notes

- TanStack Start file-based routes: `/` (the one-pager), `/projects/$slug`, `/journal/$slug`, `/api/public/contact` server route for the form.
- Lenis smooth-scroll wraps the app; ScrollTrigger uses Lenis's scroll proxy so anchors and scrub stay in sync.
- Hero SVG authored as layered `<g>` groups (skyline, streets, transit lines, signage, dot); timeline scrubs `strokeDashoffset`, `motionPath` for the dot, and `opacity`/`scale` on the camera group.
- Sanity client in `src/lib/sanity.ts`; queries co-located with routes and primed via `ensureQueryData` + `useSuspenseQuery`.
- Contact form: Zod-validated server function, sends via Resend (add secret at wire-up time).

## What I need from you before I start

- Confirm Sanity is fine (I'll walk you through the 2-minute connect step).
- Placeholder copy is OK to ship the concept; swap in the real NDA copy at handover.
- I'll use invented studio branding ("Wayline Studio") as a stand-in until you give me the real name/logo.

Ready to build on approval.
