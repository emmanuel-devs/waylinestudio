import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const projects = useQuery({
    queryKey: ["admin-project-count"],
    queryFn: async () => {
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      const { count: published } = await supabase.from("projects").select("*", { count: "exact", head: true }).eq("published", true);
      return { total: count ?? 0, published: published ?? 0 };
    },
  });
  const posts = useQuery({
    queryKey: ["admin-post-count"],
    queryFn: async () => {
      const { count } = await supabase.from("posts").select("*", { count: "exact", head: true });
      const { count: published } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", true);
      return { total: count ?? 0, published: published ?? 0 };
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Content</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage what appears on the public site.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/admin/projects" className="border border-hairline p-6 hover:border-accent transition-colors rounded">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Projects</div>
          <div className="mt-3 font-display text-3xl">{projects.data?.total ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">{projects.data?.published ?? 0} published</div>
        </Link>
        <Link to="/admin/posts" className="border border-hairline p-6 hover:border-accent transition-colors rounded">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Journal</div>
          <div className="mt-3 font-display text-3xl">{posts.data?.total ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">{posts.data?.published ?? 0} published</div>
        </Link>
      </div>
    </div>
  );
}
