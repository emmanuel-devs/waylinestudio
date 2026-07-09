import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { RichEditor } from "./RichEditor";
import { slugify, type Post } from "@/lib/content";

type Props = { post?: Post | null };

export function PostForm({ post }: Props) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    published_at: post?.published_at ? post.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    category: post?.category ?? "",
    excerpt: post?.excerpt ?? "",
    cover_image: post?.cover_image ?? null,
    body: post?.body ?? "",
    published: post?.published ?? false,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    const finalSlug = (form.slug.trim() || slugify(form.title)).slice(0, 100);

    const { data: conflict } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();
    if (conflict && conflict.id !== post?.id) {
      setSaving(false);
      return toast.error(`Slug "${finalSlug}" is already used by another post.`);
    }

    const payload = {
      title: form.title.trim(),
      slug: finalSlug,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
      category: form.category.trim() || null,
      excerpt: form.excerpt.trim() || null,
      cover_image: form.cover_image,
      body: form.body,
      published: form.published,
    };
    const res = post
      ? await supabase.from("posts").update(payload).eq("id", post.id)
      : await supabase.from("posts").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(post ? "Post updated" : "Post created");
    navigate({ to: "/admin/posts" });
  }

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">{post ? "Edit post" : "New post"}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="pub" checked={form.published} onCheckedChange={(v) => set("published", v)} />
            <Label htmlFor="pub" className="text-sm">Published</Label>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <F label="Title"><Input value={form.title} onChange={(e) => { set("title", e.target.value); if (!post) set("slug", slugify(e.target.value)); }} required maxLength={200} /></F>
        <F label="Slug"><Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required maxLength={100} /></F>
        <F label="Category"><Input value={form.category} onChange={(e) => set("category", e.target.value)} maxLength={80} /></F>
        <F label="Published date"><Input type="date" value={form.published_at} onChange={(e) => set("published_at", e.target.value)} /></F>
      </div>

      <F label="Excerpt"><Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={3} maxLength={500} /></F>

      <ImageUpload label="Cover image" folder="posts" value={form.cover_image} onChange={(p) => set("cover_image", p)} />

      <div>
        <Label className="text-sm font-medium">Body</Label>
        <div className="mt-2"><RichEditor value={form.body} onChange={(html) => set("body", html)} /></div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
        <Button type="button" variant="ghost" onClick={() => navigate({ to: "/admin/posts" })}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      </div>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm font-medium">{label}</Label>{children}</div>;
}
