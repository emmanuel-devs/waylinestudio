import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://waylinestudio.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supabase = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
        );

        const [{ data: projects }, { data: posts }] = await Promise.all([
          supabase.from("projects").select("slug, updated_at").eq("published", true),
          supabase.from("posts").select("slug, updated_at, published_at").eq("published", true),
        ]);

        type Entry = { path: string; lastmod?: string; changefreq?: string; priority?: string };
        const entries: Entry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
        ];
        for (const p of projects ?? []) {
          entries.push({ path: `/projects/${p.slug}`, lastmod: p.updated_at?.slice(0, 10), changefreq: "monthly", priority: "0.8" });
        }
        for (const p of posts ?? []) {
          entries.push({ path: `/journal/${p.slug}`, lastmod: (p.updated_at ?? p.published_at ?? undefined)?.slice(0, 10), changefreq: "monthly", priority: "0.6" });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
