"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export type UserRole = "buyer" | "seller" | "admin";

export interface UserProfile {
  id: string;
  auth_id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar_url: string | null;
  is_certified: boolean;
  is_active: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (authId: string, fetchedUser?: SupabaseUser) => {
    // maybeSingle previne o "Error 406 (Not Acceptable)" quando a tabela estiver vazia para esse usuário
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .maybeSingle();

    if (data && !error) {
      setUser(data as UserProfile);
      return data;
    }

    const activeUser = fetchedUser || supabaseUser;

    // Se não encontrou o perfil (data vindo null), indica que o usuário logou (ex: via Google) mas o perfil público não foi criado
    if (!data && activeUser) {
      const email = activeUser.email || "";
      const name = activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || email.split("@")[0] || "Usuário";
      const avatar_url = activeUser.user_metadata?.avatar_url || null;

      // Cria o perfil faltante assumindo o default 'buyer', que o usuário pode trocar no painel depois.
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
        setUser(newProfile as UserProfile);
        return newProfile;
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id, s.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
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

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw error;

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        auth_id: data.user.id,
        email,
        name,
        role,
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

  const setUserRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
      supabase.from("users").update({ role }).eq("id", user.id);
    }
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
        setUserRole,
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
