"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MediaCard } from "@/components/MediaCard";
import { useEffect } from "react";

const mediaTypes = ["Outdoor", "Painel LED", "TV", "Rádio", "Influenciador Digital", "Parada de Ônibus"];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get("tipo");

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(tipoParam ? [tipoParam] : []);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [dbCards, setDbCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch("http://localhost:4000/api/cards");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((card: any) => {
            const user = Array.isArray(card.users) ? card.users[0] : card.users;
            return {
              id: card.id,
              title: card.title || 'Sem título',
              type: card.media_type || 'Digital',
              location: card.location_city ? `${card.location_city}, ${card.location_state}` : 'Nacional',
              price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.price || 0),
              priceNumber: Number(card.price) || 0,
              reach: card.metrics?.avg_reach ? `${(card.metrics.avg_reach / 1000).toFixed(0)}k alcançados` : 'Visualizações não medidas',
              reachNumber: card.metrics?.avg_reach || 0,
              image: card.cover_url || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80',
              seller: user?.name || 'Vendedor',
              rating: 5.0,
              verified: user?.is_certified || false
            };
          });
          setDbCards(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch API cards", err);
      } finally {
        setLoadingCards(false);
      }
    }
    fetchCards();
  }, []);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setMinPrice(0);
    setMaxPrice(50000);
    setSortBy("relevance");
    setSelectedTypes([]);
    setVerifiedOnly(false);
  };

  const filtered = useMemo(() => {
    let result = [...dbCards];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) => m.title.toLowerCase().includes(q) || m.type.toLowerCase().includes(q) || m.location.toLowerCase().includes(q)
      );
    }
    if (selectedTypes.length > 0) result = result.filter((m) => selectedTypes.includes(m.type));
    result = result.filter((m) => m.priceNumber >= minPrice && m.priceNumber <= maxPrice);
    if (verifiedOnly) result = result.filter((m) => m.verified);

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.priceNumber - b.priceNumber); break;
      case "price-high": result.sort((a, b) => b.priceNumber - a.priceNumber); break;
      case "reach-high": result.sort((a, b) => b.reachNumber - a.reachNumber); break;
    }
    return result;
  }, [searchQuery, selectedTypes, minPrice, maxPrice, verifiedOnly, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Search bar */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cidade, tipo de mídia ou localização..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
            <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl font-medium transition-colors">
              <Search className="h-5 w-5" /> Buscar
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:block ${showFilters ? "block" : "hidden"} lg:col-span-1`}>
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-32 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Filtros</h3>
                <button className="lg:hidden" onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
              </div>

              {/* Tipo */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm text-gray-700">Tipo de mídia</h4>
                <div className="space-y-2">
                  {mediaTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)}
                        className="rounded border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a]" />
                      <span className="text-sm text-gray-600">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm text-gray-700">Faixa de preço</h4>
                <div className="flex gap-2">
                  <input type="number" placeholder="Mín" value={minPrice || ""} onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#1e3a8a] outline-none" />
                  <input type="number" placeholder="Máx" value={maxPrice === 50000 ? "" : maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value) || 50000)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#1e3a8a] outline-none" />
                </div>
              </div>

              {/* Verified */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={verifiedOnly} onChange={() => setVerifiedOnly(!verifiedOnly)}
                    className="rounded border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a]" />
                  <span className="text-sm text-gray-600">Apenas verificadas</span>
                </label>
              </div>

              <button onClick={clearFilters} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Limpar filtros
              </button>
            </div>
          </aside>

          {/* Grid */}
          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600"><span className="font-semibold text-gray-900">{filtered.length}</span> mídias encontradas</p>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-[#1e3a8a] outline-none">
                <option value="relevance">Relevância</option>
                <option value="price-low">Menor preço</option>
                <option value="price-high">Maior preço</option>
                <option value="reach-high">Maior alcance</option>
              </select>
            </div>

            {loadingCards ? (
              <div className="flex justify-center items-center py-20">
                 <div className="animate-spin h-10 w-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((media) => (
                  <MediaCard key={media.id} {...media} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma mídia encontrada</h3>
                <p className="text-gray-500">Tente ajustar seus filtros de busca</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full" /></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
