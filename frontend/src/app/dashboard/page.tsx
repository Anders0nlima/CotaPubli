"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Upload, MessageCircle, Calendar, DollarSign,
  Eye, TrendingUp, Plus, Settings, Users, ShoppingBag,
  FileCheck, AlertCircle, CheckCircle2, Megaphone, ArrowRight,
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

  // Admin dashboard stays separate
  if (user.role === "admin") return <AdminDashboard />;

  // Unified dashboard — shows buyer + seller features based on activity
  return <UnifiedDashboard userName={user.name} hasListings={user.has_listings} draftCount={user.draft_count} />;
}

// ─── UNIFIED DASHBOARD ──────────────────────────────────────────
function UnifiedDashboard({ userName, hasListings, draftCount }: { userName: string; hasListings: boolean; draftCount: number }) {
  const [mySpaces, setMySpaces] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loadingView, setLoadingView] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [resCards, resOrders] = await Promise.all([
          fetch('/api/cards/my/listings'),
          fetch('/api/orders')
        ]);
        
        if (resCards.ok) setMySpaces(await resCards.json());
        if (resOrders.ok) setMyOrders(await resOrders.json());
      } catch (err) {
         console.error(err);
      } finally {
        setLoadingView(false);
      }
    }
    loadDashboard();
  }, []);
  const buyerStats = [
    { icon: ShoppingBag, label: "Compras realizadas", value: "3", color: "#1e3a8a" },
    { icon: DollarSign, label: "Investido este mês", value: formatCurrency(15200), color: "#10b981" },
    { icon: Eye, label: "Impressões totais", value: formatNumber(1200000), color: "#f97316" },
    { icon: MessageCircle, label: "Conversas ativas", value: "5", color: "#8b5cf6" },
  ];

  const sellerStats = [
    { icon: Upload, label: "Espaços cadastrados", value: "3", color: "#1e3a8a" },
    { icon: DollarSign, label: "Receita este mês", value: formatCurrency(11500), color: "#10b981" },
    { icon: Eye, label: "Impressões totais", value: formatNumber(2400000), color: "#f97316" },
    { icon: Calendar, label: "Reservas ativas", value: "6", color: "#8b5cf6" },
  ];

  const stats = hasListings ? sellerStats : buyerStats;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta, {userName.split(" ")[0]}!</h1>
            <p className="text-gray-600 mt-1">
              {hasListings
                ? "Gerencie suas mídias e acompanhe o desempenho."
                : "Acompanhe suas campanhas e gerencie seus anúncios."
              }
            </p>
          </div>
          {hasListings && (
            <Link href="/anunciar" className="hidden sm:flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
              <Plus className="h-5 w-5" /> Novo anúncio
            </Link>
          )}
        </div>

        {/* Draft resume banner */}
        {draftCount > 0 && (
          <Link
            href="/anunciar"
            className="flex items-center justify-between p-4 mb-6 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white rounded-xl hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Você tem {draftCount} rascunho(s) pendente(s)</p>
                <p className="text-sm text-blue-200">Continue de onde parou e publique seu espaço</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}

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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {hasListings ? (
              /* Seller: Show spaces list */
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Meus Espaços Publicitários</h2>
                    <p className="text-sm text-gray-600">Gerencie e monitore seus espaços cadastrados</p>
                  </div>
                  <Link href="/anunciar" className="sm:hidden flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <Plus className="h-4 w-4" /> Cadastrar
                  </Link>
                </div>

                <div className="space-y-4">
                  {loadingView ? (
                     <div className="text-center py-4 text-gray-500">Carregando seus espaços...</div>
                  ) : mySpaces.length === 0 ? (
                     <div className="text-center py-4 text-gray-500">Você ainda não tem espaços cadastrados.</div>
                  ) : mySpaces.slice(0, 3).map((space: any) => (
                    <div key={space.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                          <img src={space.cover_url || "https://images.unsplash.com/photo-1652765436113-3f856919ff53?w=100&q=60"} alt={space.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{space.title || 'Sem título'}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> -- views</span>
                            <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {formatCurrency(space.price || 0)}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        space.status === "active" ? "bg-green-100 text-green-700" : 
                        space.status === "sold" ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {space.status === "active" ? "Ativo" : space.status === "sold" ? "Vendido" : space.status === "paused" ? "Pausado" : "Rascunho"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Buyer: Show campaigns */
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Minhas Compras Originais</h2>
                <div className="space-y-4">
                  {loadingView ? (
                     <div className="text-center py-4 text-gray-500">Carregando seus pedidos...</div>
                  ) : myOrders.length === 0 ? (
                     <div className="text-center py-4 text-gray-500">Você ainda não realizou nenhuma compra.</div>
                  ) : myOrders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="flex flex-col p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-10 rounded-full ${
                             order.status === "paid" ? "bg-green-500" : "bg-yellow-500"
                           }`} />
                           <div>
                             <p className="font-medium text-gray-900 text-sm">Pedido Principal: #{order.id.slice(0, 8)}</p>
                             <p className="text-xs text-gray-500">Feito em {new Date(order.created_at).toLocaleDateString()} - <span className="font-semibold text-gray-700">{formatCurrency(order.total_amount)}</span></p>
                           </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                           order.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                           {order.status === "paid" ? "Pago" : "Pendente"}
                        </span>
                      </div>
                      
                      <div className="pl-5 ml-2 mt-2 border-l-2 border-gray-200">
                         {order.order_items?.map((item: any) => (
                            <p key={item.id} className="text-xs text-gray-600 mb-1">
                               ➔ <span className="font-medium">1x Cota (Ref: {item.media_card_id.slice(0,6)})</span> - Valor de Trava: {formatCurrency(item.unit_price)}
                            </p>
                         ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
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

            {/* CTA: Become a host (if no listings) */}
            {!hasListings && (
              <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-white/20 rounded-lg">
                    <Megaphone className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Tem um espaço publicitário?
                </h3>
                <p className="text-sm text-blue-200 mb-4">
                  Anuncie na CotaPubli e comece a gerar receita com seu espaço de mídia.
                </p>
                <Link
                  href="/anunciar"
                  className="inline-flex items-center gap-2 bg-white text-[#1e3a8a] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
                >
                  Anuncie seu Espaço <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
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
