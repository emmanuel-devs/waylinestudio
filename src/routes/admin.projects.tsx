import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/content";

export const Route = createFileRoute("/admin/projects")({
  component: ProjectsList,
});

function ProjectsList() {
  const qc = useQueryClient();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });

  async function del(id: string) {
    if (!confirm("Delete this project? This can't be undone.")) return;
    await supabase.from("projects").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  }

  async function togglePublish(p: Project) {
    await supabase.from("projects").update({ published: !p.published }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Projects</h1>
        <Button asChild><Link to="/admin/projects/new">+ New project</Link></Button>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="border border-hairline rounded p-12 text-center text-sm text-muted-foreground">
          No projects yet. Click <strong>+ New project</strong> to add one.
        </div>
      ) : (
        <div className="border border-hairline rounded divide-y divide-hairline">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link to="/admin/projects/$id" params={{ id: p.id }} className="font-medium hover:text-accent">{p.title}</Link>
                  {!p.published && <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-muted rounded">Draft</span>}
                  {p.featured && <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-accent/20 text-accent rounded">Featured</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {p.client ?? "—"} · {p.year ?? "—"} · /{p.slug}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => togglePublish(p)}>
                {p.published ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/projects/$id" params={{ id: p.id }}>Edit</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => del(p.id)}>Delete</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
