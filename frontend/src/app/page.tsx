"use client";

import Link from "next/link";
import {
  ArrowRight, Search, Shield, Zap, TrendingUp, CheckCircle,
  Radio, Tv, Users, MapPin, Building2, Video, FileText,
  Edit3, Layout, Share2, Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const mediaTypes = [
  { icon: Building2, title: "Outdoor", description: "Painéis fixos em vias públicas", image: "https://images.unsplash.com/photo-1763671727638-5bc55bb9c980?w=600&q=80" },
  { icon: Zap, title: "Painel LED", description: "Telas digitais de alta visibilidade", image: "https://images.unsplash.com/photo-1652765436113-3f856919ff53?w=600&q=80" },
  { icon: Tv, title: "TV", description: "Inserções em programação televisiva", image: "https://images.unsplash.com/photo-1671575584088-03eb2811c30f?w=600&q=80" },
  { icon: Radio, title: "Rádio", description: "Spots em rádios locais e regionais", image: "https://images.unsplash.com/photo-1767474833531-c1be2788064a?w=600&q=80" },
  { icon: Users, title: "Influenciador Digital", description: "Divulgação por creators", image: "https://images.unsplash.com/photo-1762535120786-76238d9eeb0d?w=600&q=80" },
  { icon: MapPin, title: "Parada de Ônibus", description: "Espaços em abrigos urbanos", image: "https://images.unsplash.com/photo-1579977789113-266e6c88c0ea?w=600&q=80" },
];

const tccineServices = [
  { icon: Video, title: "Produção de vídeo publicitário", description: "Vídeos profissionais para TV, painéis LED e mídias digitais" },
  { icon: FileText, title: "Criação de roteiro", description: "Roteiros estratégicos que comunicam sua mensagem com impacto" },
  { icon: Edit3, title: "Edição profissional", description: "Edição cinematográfica com motion graphics e efeitos visuais" },
  { icon: Layout, title: "Design para outdoor e painéis", description: "Peças gráficas otimizadas para alta visibilidade em mídia física" },
  { icon: Share2, title: "Campanhas para redes sociais", description: "Conteúdo adaptado para Instagram, Facebook, TikTok e YouTube" },
  { icon: Sparkles, title: "Consultoria criativa", description: "Orientação estratégica para maximizar o retorno da sua campanha" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header variant="transparent" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1e3a8a] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzFmNGU5NiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIuMiIvPjwvZz48L3N2Zz4=')] opacity-10" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Publicidade sem burocracia. Invista direto na mídia certa.
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Conectamos empresários a donos de mídia de forma simples, segura e transparente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/explorar"
                  className="inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-lg h-14 px-8 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/25"
                >
                  Quero anunciar <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/anunciar"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-lg h-14 px-8 rounded-xl font-semibold backdrop-blur-sm transition-all"
                >
                  Anuncie seu Espaço
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                {[
                  { value: "500+", label: "Mídias cadastradas" },
                  { value: "1.2k+", label: "Empresários ativos" },
                  { value: "98%", label: "Satisfação" },
                ].map((stat, i) => (
                  <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in-up animation-delay-300">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1758521961744-939de61d5cb4?w=800&q=80"
                  alt="Dashboard Cotapubli"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a8a]/50 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 animate-float hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Alcance total</p>
                    <p className="text-sm font-bold text-gray-900">2.4M pessoas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simples e direto. Em 3 passos você conecta sua marca ao público certo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "1. Encontre a mídia ideal", desc: "Navegue por centenas de opções de mídia física e digital. Filtre por localização, alcance e preço.", color: "#1e3a8a" },
              { icon: CheckCircle, title: "2. Compre sua cota", desc: "Escolha o período, efetue o pagamento seguro e pronto. Sem intermediários desnecessários.", color: "#f97316" },
              { icon: TrendingUp, title: "3. Envie sua campanha e acompanhe", desc: "Faça upload do material, comunique-se via chat e monitore os resultados em tempo real.", color: "#10b981" },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: `${step.color}15` }}>
                    <Icon className="h-8 w-8" style={{ color: step.color }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TCCINE Section */}
      <section className="bg-gradient-to-br from-gray-900 via-[#1e3a8a] to-gray-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#f97316] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1e40af] rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-[#f97316]" />
              <span className="text-sm font-medium">Parceria Exclusiva</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              CotaPubli + <span className="text-[#f97316]">TCCINE</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">Produção publicitária profissional para sua campanha</p>
            <p className="text-blue-200 mt-3 max-w-2xl mx-auto">
              Comprou o espaço? Agora produza sua peça publicitária com a qualidade audiovisual que sua marca merece.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {tccineServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={i} className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 hover:border-[#f97316]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-[#f97316] to-[#ea580c] group-hover:scale-110 transition-transform flex-shrink-0">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                      <p className="text-sm text-blue-200">{service.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <Link href="/explorar" className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/25">
              Explorar mídias <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tipos de Mídia */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tipos de mídia disponíveis</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Da mídia tradicional ao digital. Tudo em um só lugar.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaTypes.map((media, i) => {
              const Icon = media.icon;
              return (
                <Link key={i} href={`/explorar?tipo=${encodeURIComponent(media.title)}`} className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img src={media.image} alt={media.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#1e3a8a]/10">
                        <Icon className="h-5 w-5 text-[#1e3a8a]" />
                      </div>
                      <h3 className="font-semibold text-lg">{media.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{media.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Link href="/explorar" className="inline-flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]">
              Ver todas as mídias <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Para empresários</h2>
              <div className="space-y-6">
                {[
                  { icon: Zap, title: "Simples e intuitivo", desc: "Interface pensada para quem não tem tempo a perder. Encontre, compre e publique em minutos." },
                  { icon: CheckCircle, title: "Transparente", desc: "Preços claros, métricas reais e sem surpresas. Você sabe exatamente o que está comprando." },
                  { icon: Shield, title: "Seguro", desc: "Pagamentos protegidos e comunicação direta com verificação de identidade." },
                  { icon: ArrowRight, title: "Sem burocracia", desc: "Esqueça contratos complexos e processos longos. Tudo digital e ágil." },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#1e3a8a]/10 flex items-center justify-center group-hover:bg-[#1e3a8a]/20 transition-colors">
                          <Icon className="h-6 w-6 text-[#1e3a8a]" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Para donos de mídia</h2>
              <div className="space-y-6">
                {[
                  { icon: TrendingUp, title: "Aumento de ocupação", desc: "Alcance milhares de empresários buscando exatamente o que você oferece." },
                  { icon: Shield, title: "Segurança financeira", desc: "Receba pagamentos garantidos e antecipados. Sem risco de inadimplência." },
                  { icon: Zap, title: "Gestão simplificada", desc: "Controle suas mídias, clientes e agendamentos em um painel intuitivo." },
                  { icon: Users, title: "Networking", desc: "Construa relacionamentos com empresários e marcas de todo o Brasil." },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#f97316]/10 flex items-center justify-center group-hover:bg-[#f97316]/20 transition-colors">
                          <Icon className="h-6 w-6 text-[#f97316]" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Pronto para transformar sua publicidade?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresários que já estão anunciando de forma mais inteligente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/explorar" className="inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-lg h-14 px-8 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/25">
              Começar agora <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/como-funciona" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-lg h-14 px-8 rounded-xl font-semibold backdrop-blur-sm transition-all">
              Falar com especialista
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
