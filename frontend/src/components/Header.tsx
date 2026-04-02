"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu, X, ShoppingCart, LayoutDashboard, Heart,
  ArrowLeftRight, User, ShoppingBag, Store, LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn, getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

interface HeaderProps {
  variant?: "transparent" | "solid";
}

export function Header({ variant = "solid" }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout, setUserRole, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    toast.success("Você saiu da sua conta");
  };

  const handleToggleRole = () => {
    if (!user) return;
    const newRole = user.role === "buyer" ? "seller" : "buyer";
    setUserRole(newRole as any);
    toast.success(newRole === "buyer" ? "Perfil: Comprador" : "Perfil: Vendedor");
    setDropdownOpen(false);
    router.push("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        variant === "transparent"
          ? "bg-white/95 backdrop-blur-md"
          : "bg-white shadow-sm"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-[#1e3a8a]">Cotapubli</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/explorar" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-sm font-medium">
              Explorar
            </Link>
            <Link href="/como-funciona" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-sm font-medium">
              Como funciona
            </Link>
            {!isAuthenticated && (
              <Link href="/para-donos-de-midia" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-sm font-medium">
                Para donos de mídia
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart */}
            <Link href="/carrinho" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#1e3a8a] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Meu Painel
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(user.name)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name.split(" ")[0]}</span>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <p className="text-xs text-[#f97316] font-medium mt-1 capitalize">
                            {user.role === "buyer" ? "Comprador" : user.role === "seller" ? "Vendedor" : "Admin"}
                          </p>
                        </div>
                        <Link href="/minha-conta" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <User className="h-4 w-4" /> Minha Conta
                        </Link>
                        <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <ShoppingBag className="h-4 w-4" /> Minhas Compras
                        </Link>
                        <Link href="/favoritos" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Heart className="h-4 w-4" /> Favoritos
                        </Link>
                        {user.role === "seller" && (
                          <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Store className="h-4 w-4" /> Minhas Mídias
                          </Link>
                        )}
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={handleToggleRole} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full">
                          <ArrowLeftRight className="h-4 w-4" />
                          Alternar para {user.role === "buyer" ? "Vendedor" : "Comprador"}
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                          <LogOut className="h-4 w-4" /> Sair
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              !isLoading && (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#1e3a8a] transition-colors">
                    Entrar
                  </Link>
                  <Link href="/registro" className="px-5 py-2.5 text-sm font-medium bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg transition-colors shadow-sm">
                    Cadastrar
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link href="/explorar" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-[#1e3a8a] py-2">Explorar</Link>
              <Link href="/como-funciona" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-[#1e3a8a] py-2">Como funciona</Link>
              {!isAuthenticated && (
                <Link href="/para-donos-de-midia" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-[#1e3a8a] py-2">Para donos de mídia</Link>
              )}
              <div className="border-t pt-3 mt-1" />
              {isAuthenticated && user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-[#1e3a8a] py-2">
                    <LayoutDashboard className="h-4 w-4" /> Meu Painel
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-2 text-red-600 py-2">
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="py-2 text-center border border-gray-200 rounded-lg text-gray-700">Entrar</Link>
                  <Link href="/registro" onClick={() => setMobileOpen(false)} className="py-2 text-center bg-[#f97316] text-white rounded-lg">Cadastrar</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
