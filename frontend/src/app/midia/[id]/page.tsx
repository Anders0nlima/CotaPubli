"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Star, BadgeCheck, ShoppingCart, MessageCircle, Heart, Share2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { mediaListings } from "@/data/mediaData";

export default function MidiaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const media = mediaListings.find((m) => m.id === id);

  if (!media) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mídia não encontrada</h1>
          <Link href="/explorar" className="text-[#1e3a8a] hover:underline">Voltar ao marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/explorar" className="hover:text-[#1e3a8a] flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Explorar
          </Link>
          <span>/</span>
          <span className="text-gray-700">{media.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
              <img src={media.image} alt={media.title} className="w-full h-[400px] object-cover" />
            </div>

            {/* Info */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-full text-sm font-medium">{media.type}</span>
                    {media.verified && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium flex items-center gap-1">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verificado
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{media.title}</h1>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Heart className="h-5 w-5 text-gray-400" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Share2 className="h-5 w-5 text-gray-400" /></button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {media.location}</div>
                <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {media.reach}</div>
                <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {media.rating}</div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h2>
              <p className="text-gray-600 leading-relaxed">{media.description || "Espaço publicitário disponível para veiculação de campanhas. Entre em contato para mais detalhes sobre formatos aceitos e prazos."}</p>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Tipo", value: media.type },
                  { label: "Localização", value: media.location },
                  { label: "Alcance", value: media.reach },
                  { label: "Avaliação", value: `${media.rating}/5.0` },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <p className="text-3xl font-bold text-[#1e3a8a] mb-2">{media.price}</p>
              <p className="text-sm text-gray-500 mb-6">Preço por período de veiculação</p>

              <Link
                href={`/checkout/${media.id}`}
                className="w-full flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-md mb-3"
              >
                <ShoppingCart className="h-5 w-5" /> Comprar agora
              </Link>

              <button className="w-full flex items-center justify-center gap-2 border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white py-3.5 rounded-xl font-semibold transition-all mb-6">
                <MessageCircle className="h-5 w-5" /> Enviar mensagem
              </button>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-semibold text-gray-900 mb-3">Vendedor</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center text-white text-xs font-bold">
                    {media.seller[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{media.seller}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /> {media.rating}
                      {media.verified && <BadgeCheck className="h-3.5 w-3.5 text-[#1e3a8a] ml-1" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
