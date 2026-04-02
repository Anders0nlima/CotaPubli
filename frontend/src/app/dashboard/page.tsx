"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Upload, MessageCircle, Calendar, DollarSign,
  Eye, TrendingUp, Plus, Settings, Users, ShoppingBag,
  FileCheck, AlertCircle, CheckCircle2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  // Render different dashboards based on role
  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "seller") return <SellerDashboard userName={user.name} />;
  return <BuyerDashboard userName={user.name} />;
}

// ─── BUYER DASHBOARD ──────────────────────────────────────────
function BuyerDashboard({ userName }: { userName: string }) {
  const stats = [
    { icon: ShoppingBag, label: "Compras realizadas", value: "3", color: "#1e3a8a" },
    { icon: DollarSign, label: "Investido este mês", value: formatCurrency(15200), color: "#10b981" },
    { icon: Eye, label: "Impressões totais", value: formatNumber(1200000), color: "#f97316" },
    { icon: MessageCircle, label: "Conversas ativas", value: "5", color: "#8b5cf6" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta, {userName.split(" ")[0]}!</h1>
          <p className="text-gray-600 mt-1">Acompanhe suas campanhas e gerencie seus anúncios.</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${stat.color}15` }}>
                    <Icon className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions & Campaigns */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Minhas Campanhas</h2>
              <div className="space-y-4">
                {[
                  { title: "Painel LED - Av. Paulista", status: "running", statusLabel: "Veiculando", date: "01/04 - 30/04" },
                  { title: "Outdoor - Marginal Tietê", status: "review", statusLabel: "Em revisão", date: "15/04 - 15/05" },
                  { title: "Spot Rádio Band FM", status: "pending", statusLabel: "Aguardando material", date: "01/05 - 31/05" },
                ].map((campaign, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${
                        campaign.status === "running" ? "bg-green-500" : campaign.status === "review" ? "bg-yellow-500" : "bg-blue-500"
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{campaign.title}</p>
                        <p className="text-sm text-gray-500">{campaign.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === "running" ? "bg-green-100 text-green-700" :
                      campaign.status === "review" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {campaign.statusLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações rápidas</h2>
              <div className="space-y-3">
                <Link href="/explorar" className="flex items-center gap-3 p-3 bg-[#1e3a8a]/5 hover:bg-[#1e3a8a]/10 rounded-xl text-[#1e3a8a] font-medium transition-colors">
                  <Plus className="h-5 w-5" /> Comprar nova mídia
                </Link>
                <Link href="/chat" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium transition-colors">
                  <MessageCircle className="h-5 w-5" /> Ver conversas
                </Link>
                <Link href="/minha-conta" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium transition-colors">
                  <Settings className="h-5 w-5" /> Configurações
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SELLER DASHBOARD ──────────────────────────────────────────
function SellerDashboard({ userName }: { userName: string }) {
  const stats = [
    { icon: Upload, label: "Espaços cadastrados", value: "3", color: "#1e3a8a" },
    { icon: DollarSign, label: "Receita este mês", value: formatCurrency(11500), color: "#10b981" },
    { icon: Eye, label: "Impressões totais", value: formatNumber(2400000), color: "#f97316" },
    { icon: Calendar, label: "Reservas ativas", value: "6", color: "#8b5cf6" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta, {userName.split(" ")[0]}!</h1>
            <p className="text-gray-600 mt-1">Gerencie suas mídias e acompanhe o desempenho das vendas.</p>
          </div>
          <Link href="/cadastrar-espaco" className="hidden sm:flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
            <Plus className="h-5 w-5" /> Cadastrar espaço
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-xl inline-block mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Spaces list */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Meus Espaços Publicitários</h2>
              <p className="text-sm text-gray-600">Gerencie e monitore seus espaços cadastrados</p>
            </div>
            <Link href="/cadastrar-espaco" className="sm:hidden flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Plus className="h-4 w-4" /> Cadastrar
            </Link>
          </div>

          <div className="space-y-4">
            {[
              { title: "Painel LED - Avenida Principal", status: "active", views: "12.5k", revenue: formatCurrency(4500) },
              { title: "Outdoor - Rodovia BR-101", status: "paused", views: "8.2k", revenue: formatCurrency(3200) },
              { title: "Parada de Ônibus - Centro", status: "active", views: "6.8k", revenue: formatCurrency(3800) },
            ].map((space, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1652765436113-3f856919ff53?w=100&q=60" alt={space.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{space.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {space.views}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {space.revenue}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  space.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {space.status === "active" ? "Ativo" : "Pausado"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────
function AdminDashboard() {
  const stats = [
    { icon: LayoutDashboard, label: "Total de mídias", value: "156", color: "#1e3a8a" },
    { icon: Users, label: "Usuários ativos", value: "1.234", color: "#10b981" },
    { icon: DollarSign, label: "Receita plataforma", value: formatCurrency(45600), color: "#f97316" },
    { icon: AlertCircle, label: "Pendente aprovação", value: "8", color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-1">Monitore e gerencie toda a plataforma.</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="p-2.5 rounded-xl inline-block mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mídias pendentes de aprovação</h2>
            <div className="space-y-3">
              {[
                { title: "Painel LED - Shopping Ibirapuera", seller: "Digital Media SP", type: "Painel LED" },
                { title: "Outdoor - Av. Brasil, Rio", seller: "Brasil Outdoor", type: "Outdoor" },
                { title: "Spot Radio JBFM", seller: "JBFM Publicidade", type: "Rádio" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.seller} · {item.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors">
                      <AlertCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Materials */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Materiais para revisão</h2>
            <div className="space-y-3">
              {[
                { title: "Video_campanha_verao.mp4", buyer: "Empresa ABC", format: "Vídeo 30s" },
                { title: "Banner_outdoor_final.pdf", buyer: "Loja Fashion", format: "PDF A3" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg"><FileCheck className="h-4 w-4 text-blue-600" /></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.buyer} · {item.format}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors">
                      <AlertCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
