"use client";

import Link from "next/link";
import { Search, CheckCircle, TrendingUp, ArrowRight, Shield, Zap, CreditCard, MessageCircle, BarChart3, Upload } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const steps = [
  { number: "01", icon: Search, title: "Encontre a mídia ideal", desc: "Navegue por centenas de opções de mídia física e digital. Filtre por localização, alcance, preço e tipo de mídia para encontrar o espaço perfeito para seu anúncio.", color: "#1e3a8a" },
  { number: "02", icon: CreditCard, title: "Compre de forma segura", desc: "Escolha o período de veiculação, selecione se deseja produção TCCINE, e pague via PIX com Split automático. O vendedor recebe, a plataforma retém a comissão — tudo transparente.", color: "#f97316" },
  { number: "03", icon: Upload, title: "Envie seu material", desc: "Faça upload dos arquivos da campanha diretamente pela plataforma. O vendedor analisa e aprova o material antes da veiculação começar.", color: "#10b981" },
  { number: "04", icon: MessageCircle, title: "Comunique-se via chat", desc: "Converse diretamente com o vendedor em tempo real. Tire dúvidas, negocie detalhes e acompanhe cada etapa da veiculação.", color: "#8b5cf6" },
  { number: "05", icon: BarChart3, title: "Acompanhe os resultados", desc: "Monitore impressões, alcance e desempenho no seu painel. Receba relatórios e tome decisões baseadas em dados reais.", color: "#ec4899" },
];

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Como funciona a Cotapubli</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            Uma plataforma simples e segura para conectar sua marca ao público certo. Do cadastro à veiculação,
            tudo em poucos passos.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 1;
              return (
                <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? "md:flex-row-reverse" : ""}`}>
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${step.color}15` }}>
                        <Icon className="h-10 w-10" style={{ color: step.color }} />
                      </div>
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: step.color }}>
                        {step.number}
                      </div>
                    </div>
                  </div>
                  <div className={`text-center md:text-left ${isEven ? "md:text-right" : ""}`}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed max-w-lg">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Segurança em primeiro lugar</h2>
            <p className="text-gray-600 text-lg">Todas as transações são protegidas e verificadas.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Pagamento protegido", desc: "Split de pagamento via Mercado Pago. Seu dinheiro está seguro até a confirmação da veiculação." },
              { icon: CheckCircle, title: "Vendedores verificados", desc: "Selos de certificação garantem que você está negociando com proprietários reais de mídia." },
              { icon: Zap, title: "Suporte dedicado", desc: "Equipe disponível para ajudar em cada etapa. Chat em tempo real com compradores e vendedores." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#1e3a8a]/10 mb-5">
                    <Icon className="h-7 w-7 text-[#1e3a8a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl text-blue-100 mb-8">Crie sua conta gratuitamente e comece a explorar mídias disponíveis.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro" className="inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-lg h-14 px-8 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg">
              Criar conta grátis <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/explorar" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-lg h-14 px-8 rounded-xl font-semibold transition-all">
              Explorar mídias
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
