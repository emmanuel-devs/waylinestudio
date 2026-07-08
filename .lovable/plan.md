## Goal

Replace Sanity with a built-in admin panel at `/admin`. Client logs in on your own domain, edits Projects and Journal through forms, publishes instantly — no Sanity Studio, no external account.

## What gets built

### 1. Backend (Lovable Cloud)
- Enable Lovable Cloud (Postgres + auth + file storage).
- Tables:
  - `projects` — title, slug, client, location, year, disciplines[], summary, cover_image, gallery[], body, featured, sort_order, published, timestamps
  - `posts` — title, slug, published_at, category, excerpt, cover_image, body, published, timestamps
  - `user_roles` — separate table with `admin` role (secure pattern)
- Row-Level Security: public reads only for `published = true`; writes require `admin` role.
- Storage bucket for uploaded images (cover + gallery).

### 2. Public site (unchanged UX)
- Swap `src/lib/sanity.ts` fetches → Lovable Cloud queries.
- `Projects.tsx`, `Journal.tsx`, `/projects/$slug`, `/journal/$slug` keep same look, new data source.
- Delete Sanity client + `@sanity/client` / `@sanity/image-url` packages.

### 3. Admin panel (`/admin`)
- `/admin/login` — email + password sign-in (you invite the client once).
- `/admin` — dashboard with two tabs: Projects · Journal.
- List views: table with title, status (draft/published), edit + delete, drag-to-reorder for Projects.
- Editor forms:
  - Text fields (title, client, year, etc.)
  - Image uploader with preview (drag-drop, replaces cover)
  - Multi-image gallery uploader
  - Rich text editor (TipTap) for body — headings, bold, italic, links, lists, images
  - "Publish" / "Save draft" toggle
  - Live slug generation from title
- All routes under `_authenticated/` + admin role check.

### 4. Data migration
- Read existing 4 projects + 3 journal posts from Sanity once via a seeding script.
- Insert into new tables so nothing is lost.

## Handover to client

- One email invite → they set their password.
- 15-min walkthrough of `/admin`.
- Everything on `waylinestudio.com` — one URL, one login, your branding.

## What Sanity had that this won't (initially)

- **Version history / rollback** — not built. Can add later with an `revisions` table if needed.
- **Multi-user simultaneous editing** — single-editor safe; not collaborative.
- **Image hotspot/focal point cropping** — basic upload only; can add later.

If any of those turn out to matter, we add them incrementally.

## Order of work

1. Enable Lovable Cloud + create tables/RLS/storage
2. Build `/admin` auth + dashboard shell
3. Build Projects CRUD (list, create, edit, delete, reorder, image upload, rich text)
4. Build Journal CRUD (same shape, simpler)
5. Migrate existing Sanity content into new tables
6. Swap public site to read from Cloud
7. Remove Sanity packages and files
8. Smoke-check every route

## Confirm before I start

- OK to enable **Lovable Cloud** now (creates the backend automatically, no account needed)?
- Client's admin login email — do you have one to use, or should I set a placeholder you swap later?
