"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  auth_id: string;
  role: string;
  name: string;
  email: string;
  avatar_url: string | null;
  birth_date: string | null;
  accepted_terms_at: string | null;
  is_certified: boolean;
  is_active: boolean;
  has_listings: boolean;
  draft_count: number;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (authId: string, fetchedUser?: SupabaseUser) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .maybeSingle();

    if (data && !error) {
      // Buscar contagem de listings/drafts
      const { count: totalCount } = await supabase
        .from("media_cards")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", data.id)
        .neq("status", "draft");

      const { count: draftCount } = await supabase
        .from("media_cards")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", data.id)
        .eq("status", "draft");

      const profile: UserProfile = {
        ...data,
        has_listings: (totalCount ?? 0) > 0,
        draft_count: draftCount ?? 0,
      };
      setUser(profile);
      return profile;
    }

    const activeUser = fetchedUser || supabaseUser;

    // Se não encontrou o perfil, cria automaticamente como buyer
    if (!data && activeUser) {
      const email = activeUser.email || "";
      const name = activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || email.split("@")[0] || "Usuário";
      const avatar_url = activeUser.user_metadata?.avatar_url || null;

      const { data: newProfile, error: insertError } = await supabase
        .from("users")
        .insert({
          auth_id: authId,
          email,
          name,
          role: "buyer",
          avatar_url,
        })
        .select()
        .single();

      if (!insertError && newProfile) {
        const profile: UserProfile = {
          ...newProfile,
          has_listings: false,
          draft_count: 0,
        };
        setUser(profile);
        return profile;
      }
    }

    return null;
  };

  const refreshProfile = async () => {
    if (supabaseUser) {
      await fetchProfile(supabaseUser.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id, s.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setSupabaseUser(s?.user ?? null);
        if (s?.user) {
          await fetchProfile(s.user.id, s.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;

    // Create user profile — always as buyer (conta única)
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        auth_id: data.user.id,
        email,
        name,
        role: "buyer",
        accepted_terms_at: new Date().toISOString(),
      });
      if (profileError) console.error("Profile creation error:", profileError);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        supabaseUser,
        isAuthenticated: !!session,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
