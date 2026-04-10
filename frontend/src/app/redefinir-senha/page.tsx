"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Supabase takes the access_token from the URL hash and automatically logs the user in
  // when they arrive from the "Reset Password" email link.

  useEffect(() => {
    // Optional: Verifies if user is actually authenticated from the recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Sessão inválida ou expirada. Peça um novo link de redefinição.");
        router.push("/esqueci-senha");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      toast.success("Senha redefinida com sucesso!");
      
      // Logout the temporary session so they can login properly with the new password
      await supabase.auth.signOut();
      
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Erro ao tentar redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-2xl font-bold text-[#1e3a8a]">Cotapubli</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Criar Nova Senha</h1>
          <p className="text-gray-600 mt-2">Digite sua nova senha abaixo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none transition-all"
                  placeholder="Digite a senha novamente" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 mt-2 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-md">
              {loading ? "Salvando..." : "Redefinir Senha"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
