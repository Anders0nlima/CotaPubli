"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function CompletarPerfilPage() {
  const { user, supabaseUser, refreshProfile, isLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!supabaseUser) {
        // Redireciona para login se não estiver logado
        router.push("/login");
        return;
      }
      
      // Se tiver logado mas os termos já foram aceitos, não precisa dessa tela!
      if (user?.accepted_terms_at) {
        router.push("/anunciar");
        return;
      }

      // Preenche com o nome que já veio (Google)
      if (user?.name) setName(user.name);
    }
  }, [isLoading, supabaseUser, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, informe seu nome.");
      return;
    }
    if (!birthDate) {
      toast.error("Por favor, informe sua data de nascimento.");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Você precisa aceitar os termos de uso.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: name.trim(),
          birth_date: birthDate,
          accepted_terms_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Perfil completado com sucesso!");
      await refreshProfile();
      router.push("/anunciar");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar os dados. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50">
      <div className="absolute inset-0 bg-black/5" />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center mb-5">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Falta pouco!
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Precisamos de mais alguns detalhes para configurar sua conta e garantir a segurança da plataforma.
          </p>
        </div>

        {/* Form */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-3">
              <div className="border border-gray-300 rounded-xl overflow-hidden">
                
                {/* Nome */}
                <div className="relative border-b border-gray-200 bg-white">
                  <label className="absolute left-4 top-2 text-xs text-gray-500">Nome completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 pt-7 pb-2.5 outline-none text-base bg-transparent"
                    placeholder="Seu nome"
                  />
                </div>
                
                {/* Email (Readonly) */}
                <div className="relative border-b border-gray-200">
                  <label className="absolute left-4 top-2 text-xs text-gray-500">E-mail</label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full px-4 pt-7 pb-2.5 outline-none text-base bg-gray-50 text-gray-500"
                    readOnly
                    disabled
                  />
                </div>

                {/* Data de Nascimento */}
                <div className="relative bg-white">
                  <label className="absolute left-4 top-2 text-xs text-gray-500">Data de nascimento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 pt-7 pb-2.5 outline-none text-base bg-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 px-1">
                Para se cadastrar, você precisa ter 18 anos ou mais. A sua data de nascimento não será exibida publicamente.
              </p>
            </div>

            {/* Termos de Uso */}
            <div className="pt-4 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="rounded border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a] mt-0.5"
                />
                <span className="text-sm text-gray-600">
                  Li e aceito os{" "}
                  <button type="button" className="text-[#1e3a8a] hover:underline font-medium">Termos de Uso</button>{" "}
                  e a{" "}
                  <button type="button" className="text-[#1e3a8a] hover:underline font-medium">Política de Privacidade</button>{" "}
                  do CotaPubli.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || !acceptedTerms}
                className="w-full py-4 bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {submitting ? "Finalizando..." : "Concordar e continuar"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
