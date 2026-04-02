"use client";

import Link from "next/link";
import { TrendingUp, Shield, Zap, Users, ArrowRight, CheckCircle, BarChart3, DollarSign, Headphones } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ParaDonosDeMidiaPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Aumente a ocupação dos seus espaços publicitários
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Cadastre suas mídias na Cotapubli e alcance milhares de empresários buscando exatamente o que você oferece.
            </p>
            <Link href="/registro" className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg">
              Começar a vender <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que vender na Cotapubli?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: TrendingUp, title: "Mais visibilidade", desc: "Sua mídia exposta para milhares de anunciantes em todo o Brasil.", color: "#f97316" },
              { icon: Shield, title: "Pagamento garantido", desc: "Receba antecipadamente via split. Sem risco de inadimplência.", color: "#10b981" },
              { icon: BarChart3, title: "Analytics completo", desc: "Acompanhe visualizações, vendas e desempenho no painel.", color: "#1e3a8a" },
              { icon: Headphones, title: "Suporte premium", desc: "Equipe dedicada para ajudar na gestão das suas mídias.", color: "#8b5cf6" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${item.color}15` }}>
                    <Icon className="h-7 w-7" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como funciona para vendedores</h2>
          </div>
          <div className="space-y-8">
            {[
              { step: "1", title: "Crie sua conta de vendedor", desc: "Cadastre-se gratuitamente e complete seu perfil com dados da empresa." },
              { step: "2", title: "Cadastre seus espaços", desc: "Adicione fotos, métricas de alcance, localização e preços dos seus espaços publicitários." },
              { step: "3", title: "Receba propostas", desc: "Compradores encontram suas mídias e enviam mensagens ou compram diretamente." },
              { step: "4", title: "Aprove e receba", desc: "Aprove os materiais recebidos e acompanhe os pagamentos no seu painel." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para aumentar suas vendas?</h2>
          <p className="text-xl text-blue-100 mb-8">Cadastre-se agora e comece a receber pedidos.</p>
          <Link href="/registro" className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg">
            Criar conta de vendedor <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
