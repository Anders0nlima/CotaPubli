"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

type AuthStep = "email" | "login" | "register" | "terms";

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register, loginWithGoogle } = useAuth();

  const handleEmailContinue = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Digite um e-mail válido");
      return;
    }
    // Para simplificar, mandamos direto para o register/login
    // Em um cenário real, podemos verificar se o email já existe
    setStep("login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bem-vindo de volta!");
      router.push("/");
    } catch (err: any) {
      if (err.message?.includes("Invalid login credentials")) {
        // Email não existe, sugerir cadastro
        setStep("register");
        toast("E-mail não encontrado. Crie sua conta!", { icon: "👋" });
      } else {
        toast.error(err.message || "Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (!name.trim()) {
      toast.error("Digite seu nome");
      return;
    }
    setStep("terms");
  };

  const handleAcceptTerms = async () => {
    if (!acceptedTerms) {
      toast.error("Você precisa aceitar os termos para continuar");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success("Conta criada com sucesso!");
      router.push("/anunciar");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      toast.error("Erro ao conectar com Google");
    }
  };

  const goBack = () => {
    if (step === "terms") setStep("register");
    else if (step === "register") setStep("login");
    else if (step === "login") setStep("email");
    else router.push("/");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Images */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 grid grid-cols-2">
          <div
            className="bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80')",
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-black/40 to-black/20" />
          </div>
          <div
            className="bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80')",
            }}
          >
            <div className="w-full h-full bg-gradient-to-l from-black/40 to-black/20" />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-white drop-shadow-lg">Cotapubli</span>
        </Link>
        <Link
          href="/anunciar"
          className="text-white text-sm font-medium hover:underline drop-shadow-lg hidden sm:block"
        >
          Anuncie seu Espaço
        </Link>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            {step !== "email" && (
              <button
                onClick={goBack}
                className="absolute left-8 top-8 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}

            {/* Logo */}
            <div className="inline-flex items-center justify-center mb-5">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              {step === "email" && "Entrar ou cadastrar-se"}
              {step === "login" && "Bem-vindo de volta"}
              {step === "register" && "Vamos criar sua conta"}
              {step === "terms" && "Quase lá!"}
            </h1>
            {step === "register" && (
              <p className="text-gray-500 text-sm mt-2">
                Essas informações são necessárias para usar a plataforma.
              </p>
            )}
          </div>

          <div className="px-8 pb-8">
            {/* Step: Email */}
            {step === "email" && (
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEmailContinue()}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all outline-none text-base"
                      placeholder="E-mail"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  id="btn-continue"
                  onClick={handleEmailContinue}
                  className="w-full py-4 bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/25 text-base"
                >
                  Continuar
                </button>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    id="btn-google"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-3 px-6 py-3.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step: Login */}
            {step === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="text-sm font-medium text-gray-900">{email}</p>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all outline-none text-base"
                      placeholder="Senha"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/esqueci-senha"
                    className="text-sm text-[#1e3a8a] hover:underline font-medium"
                  >
                    Esqueci a senha
                  </Link>
                </div>

                <button
                  id="btn-login"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50 text-base"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Não tem conta?{" "}
                  <button
                    type="button"
                    onClick={() => setStep("register")}
                    className="text-[#1e3a8a] font-semibold hover:underline"
                  >
                    Criar conta
                  </button>
                </p>
              </form>
            )}

            {/* Step: Register */}
            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-3">
                  <div className="border border-gray-300 rounded-xl overflow-hidden">
                    <div className="relative border-b border-gray-200">
                      <label className="absolute left-4 top-2 text-xs text-gray-500">Nome</label>
                      <input
                        id="auth-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 pt-7 pb-2.5 outline-none text-base"
                        placeholder="Seu nome"
                        autoFocus
                      />
                    </div>
                    <div className="relative">
                      <label className="absolute left-4 top-2 text-xs text-gray-500">E-mail</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 pt-7 pb-2.5 outline-none text-base bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 px-1">
                    Usaremos esse nome no seu perfil da plataforma.
                  </p>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="auth-new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all outline-none text-base"
                      placeholder="Criar senha (mín. 6 caracteres)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all outline-none text-base"
                      placeholder="Confirmar senha"
                    />
                  </div>
                </div>

                <button
                  id="btn-register"
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/25 text-base"
                >
                  Continuar
                </button>

                <p className="text-center text-sm text-gray-500">
                  Já tem conta?{" "}
                  <button
                    type="button"
                    onClick={() => setStep("login")}
                    className="text-[#1e3a8a] font-semibold hover:underline"
                  >
                    Fazer login
                  </button>
                </p>
              </form>
            )}

            {/* Step: Terms */}
            {step === "terms" && (
              <div className="space-y-5">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="inline-flex items-center justify-center mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">C</span>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    Bem-vindo à comunidade CotaPubli
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Ao usar o CotaPubli, você se compromete a tratar todos os
                    membros da comunidade com respeito e transparência,
                    garantindo negociações honestas e comunicação clara em
                    todas as transações publicitárias.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    id="accept-terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="rounded border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a] mt-0.5"
                  />
                  <span className="text-sm text-gray-600">
                    Li e aceito os{" "}
                    <button className="text-[#1e3a8a] hover:underline font-medium">
                      Termos de Uso
                    </button>{" "}
                    e a{" "}
                    <button className="text-[#1e3a8a] hover:underline font-medium">
                      Política de Privacidade
                    </button>{" "}
                    do CotaPubli.
                  </span>
                </label>

                <button
                  id="btn-accept"
                  onClick={handleAcceptTerms}
                  disabled={loading || !acceptedTerms}
                  className="w-full py-4 bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {loading ? "Criando conta..." : "Concordar e continuar"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center mt-6 text-xs text-white/70 drop-shadow">
          © 2026 CotaPubli. Publicidade sem burocracia.
        </p>
      </div>
    </div>
  );
}
