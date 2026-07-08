import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAdmin } from "@/hooks/use-admin";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AdminShell() {
  const { loading, isAdmin, email } = useAdmin();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/auth", search: { redirect: path } });
  }, [loading, isAdmin, navigate, path]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!isAdmin) return null;

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: "/admin" } });
  }

  const tab = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-3 py-1.5 text-sm rounded font-mono uppercase tracking-wider ${
        path.startsWith(to) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-hairline sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-display text-lg">Wayline Admin</Link>
            <nav className="flex gap-1">
              {tab("/admin/projects", "Projects")}
              {tab("/admin/posts", "Journal")}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">View site →</Link>
            <span className="text-xs text-muted-foreground">{email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
