"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, MapPin, DollarSign, Users, ImagePlus, X } from "lucide-react";
import { Header } from "@/components/Header";
import toast from "react-hot-toast";

export default function CadastrarEspacoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    media_type: "",
    location: "",
    price: "",
    reach: "",
    audience_age: "",
    audience_region: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: POST /api/cards with presigned cover upload
    setTimeout(() => {
      toast.success("Espaço cadastrado! Aguardando aprovação.");
      setLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1e3a8a] mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar ao painel
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cadastrar espaço publicitário</h1>
        <p className="text-gray-600 mb-8">Preencha os dados do seu espaço. Após o envio, nossa equipe revisará antes da publicação.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover upload */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Imagens</h2>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-[#1e3a8a] transition-colors cursor-pointer">
              <ImagePlus className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Clique ou arraste para adicionar fotos</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WebP. Máx 10MB</p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900 mb-2">Detalhes</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Título *</label>
              <input name="title" required value={form.title} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none"
                placeholder="Ex: Painel LED - Avenida Paulista" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
              <textarea name="description" rows={4} value={form.description} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none resize-none"
                placeholder="Descreva seu espaço, formato aceito, horários de exibição..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de mídia *</label>
                <select name="media_type" required value={form.media_type} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1e3a8a] outline-none">
                  <option value="">Selecione</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="digital">Painel LED</option>
                  <option value="tv">TV</option>
                  <option value="radio">Rádio</option>
                  <option value="influencer">Influenciador Digital</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Localização *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input name="location" required value={form.location} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none"
                    placeholder="Cidade, Estado" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço (R$) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input name="price" type="number" required value={form.price} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none"
                    placeholder="5000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alcance estimado</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input name="reach" value={form.reach} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none"
                    placeholder="50000 pessoas/dia" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl transition-all hover:scale-[1.01] shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <><Upload className="h-5 w-5" /> Enviar para aprovação</>}
          </button>
        </form>
      </div>
    </div>
  );
}
