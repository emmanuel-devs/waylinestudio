import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageUpload, MultiImageUpload } from "./ImageUpload";
import { RichEditor } from "./RichEditor";
import { slugify, type Project } from "@/lib/content";

type Props = { project?: Project | null };

export function ProjectForm({ project }: Props) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    client: project?.client ?? "",
    location: project?.location ?? "",
    year: project?.year ?? "",
    disciplines: (project?.disciplines ?? []).join(", "),
    summary: project?.summary ?? "",
    cover_image: project?.cover_image ?? null,
    gallery: project?.gallery ?? [],
    body: project?.body ?? "",
    featured: project?.featured ?? false,
    sort_order: project?.sort_order ?? 0,
    published: project?.published ?? false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: (form.slug.trim() || slugify(form.title)).slice(0, 100),
      client: form.client.trim() || null,
      location: form.location.trim() || null,
      year: form.year.trim() || null,
      disciplines: form.disciplines.split(",").map((s) => s.trim()).filter(Boolean),
      summary: form.summary.trim() || null,
      cover_image: form.cover_image,
      gallery: form.gallery,
      body: form.body,
      featured: form.featured,
      sort_order: Number(form.sort_order) || 0,
      published: form.published,
    };
    const res = project
      ? await supabase.from("projects").update(payload).eq("id", project.id)
      : await supabase.from("projects").insert(payload);
    setSaving(false);
    if (res.error) return alert(res.error.message);
    navigate({ to: "/admin/projects" });
  }

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">{project ? "Edit project" : "New project"}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="pub" checked={form.published} onCheckedChange={(v) => set("published", v)} />
            <Label htmlFor="pub" className="text-sm">Published</Label>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Title">
          <Input value={form.title} onChange={(e) => {
            set("title", e.target.value);
            if (!project) set("slug", slugify(e.target.value));
          }} required maxLength={200} />
        </Field>
        <Field label="Slug (URL)">
          <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required maxLength={100} />
        </Field>
        <Field label="Client">
          <Input value={form.client} onChange={(e) => set("client", e.target.value)} maxLength={200} />
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={200} />
        </Field>
        <Field label="Year">
          <Input value={form.year} onChange={(e) => set("year", e.target.value)} maxLength={20} />
        </Field>
        <Field label="Sort order (lower = earlier)">
          <Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Disciplines (comma-separated)">
        <Input value={form.disciplines} onChange={(e) => set("disciplines", e.target.value)} placeholder="Wayfinding, Signage, Strategy" />
      </Field>

      <Field label="Summary (short)">
        <Textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={3} maxLength={500} />
      </Field>

      <ImageUpload label="Cover image" folder="projects" value={form.cover_image} onChange={(p) => set("cover_image", p)} />

      <MultiImageUpload label="Gallery" folder="projects" values={form.gallery} onChange={(p) => set("gallery", p)} />

      <div>
        <Label className="text-sm font-medium">Body</Label>
        <div className="mt-2">
          <RichEditor value={form.body} onChange={(html) => set("body", html)} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="feat" checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
        <Label htmlFor="feat" className="text-sm">Featured project</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
        <Button type="button" variant="ghost" onClick={() => navigate({ to: "/admin/projects" })}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
