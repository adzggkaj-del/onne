import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  uid_display: string | null;
  verified: boolean;
  bonus_krw: number;
  usdt_balance: number;
  last_ip: string | null;
}

const fetchAndStoreIP = async (userId: string) => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const { ip } = await res.json();
    if (ip) {
      await supabase
        .from("profiles")
        .update({ last_ip: ip } as any)
        .eq("user_id", userId);
    }
  } catch {
    // silently fail
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile with setTimeout to avoid deadlock
          setTimeout(async () => {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", session.user.id)
              .single();
            setProfile(data as Profile | null);
          }, 0);

          // Store IP on sign in
          if (_event === "SIGNED_IN") {
            fetchAndStoreIP(session.user.id);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data as Profile | null));
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string, phone?: string, secondaryPassword?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username, phone },
      },
    });
    if (!error && data.user && (phone || secondaryPassword)) {
      const updates: Record<string, string> = {};
      if (phone) updates.phone = phone;
      if (secondaryPassword) updates.secondary_password = secondaryPassword;
      await supabase.from("profiles").update(updates as any).eq("user_id", data.user.id);
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return { user, session, profile, loading, signUp, signIn, signOut };
};
