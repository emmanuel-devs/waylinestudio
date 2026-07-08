import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminState = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
};

export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({
    loading: true,
    userId: null,
    email: null,
    isAdmin: false,
  });

  useEffect(() => {
    let active = true;

    async function check(userId: string | null, email: string | null) {
      if (!userId) {
        if (active) setState({ loading: false, userId: null, email: null, isAdmin: false });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (active) {
        setState({ loading: false, userId, email, isAdmin: !!data });
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      check(u?.id ?? null, u?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      const u = session?.user;
      check(u?.id ?? null, u?.email ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
