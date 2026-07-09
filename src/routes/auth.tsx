import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  component: AuthPage,
  head: () => ({ meta: [{ title: "Admin sign in — Wayline" }, { name: "robots", content: "noindex" }] }),
});

type Mode = "signin" | "signup" | "reset";

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: (redirect as any) || "/admin" });
    });
  }, [navigate, redirect]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: (redirect as any) || "/admin" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created — check your inbox if confirmation is required.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Password reset email sent — check your inbox.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const heading =
    mode === "signin" ? "Sign in to edit content."
    : mode === "signup" ? "Create your account."
    : "Reset your password.";

  const cta =
    mode === "signin" ? "Sign in"
    : mode === "signup" ? "Create account"
    : "Send reset email";

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5 border border-hairline p-8 rounded">
        <div>
          <h1 className="font-display text-2xl">Wayline Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">{heading}</p>
        </div>
        <div className="space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          {mode !== "reset" && (
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          )}
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "…" : cta}
        </Button>
        <div className="flex flex-col gap-1.5 pt-1">
          {mode !== "signin" && (
            <button type="button" onClick={() => setMode("signin")} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
              ← Back to sign in
            </button>
          )}
          {mode === "signin" && (
            <>
              <button type="button" onClick={() => setMode("reset")} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                Forgot password?
              </button>
              <button type="button" onClick={() => setMode("signup")} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                Need an account? Sign up
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
