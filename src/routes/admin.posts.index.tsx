import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Post } from "@/lib/content";

export const Route = createFileRoute("/admin/posts/")({
  component: PostsList,
});

function PostsList() {
  const qc = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
  });

  async function del(p: Post) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Post deleted");
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }

  async function togglePublish(p: Post) {
    const patch: Partial<Post> = { published: !p.published };
    if (!p.published && !p.published_at) patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("posts").update(patch).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(p.published ? "Unpublished" : "Published");
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Journal</h1>
        <Button asChild><Link to="/admin/posts/new">+ New post</Link></Button>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="border border-hairline rounded p-12 text-center text-sm text-muted-foreground">
          No posts yet.
        </div>
      ) : (
        <div className="border border-hairline rounded divide-y divide-hairline">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link to="/admin/posts/$id" params={{ id: p.id }} className="font-medium hover:text-accent">{p.title}</Link>
                  {!p.published && <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-muted rounded">Draft</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {p.category ?? "—"} · {p.published_at ? new Date(p.published_at).toLocaleDateString() : "unscheduled"} · /{p.slug}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => togglePublish(p)}>
                {p.published ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/posts/$id" params={{ id: p.id }}>Edit</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => del(p)}>Delete</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
