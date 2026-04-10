"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, supabaseUser, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!supabaseUser) {
      router.push("/login");
      return;
    }

    // Se usuário já foi carregado no AuthContext
    if (user) {
      if (!user.accepted_terms_at || !user.birth_date) {
        // Falta preencher perfil (veio do Google Auth pela 1ª vez)
        router.push("/completar-perfil");
      } else {
        // Já tem o perfil completo, pode mandar pra /anunciar ou / (Home)
        // Como você sugeriu no doc, quem finaliza cadastro já vai direto
        // se já tem conta completa vindo do google, vai pra home.
        router.push("/");
      }
    }
  }, [isLoading, user, supabaseUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Autenticando...</p>
      </div>
    </div>
  );
}
