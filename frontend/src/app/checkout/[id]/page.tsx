"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Shield, Video, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { mediaListings } from "@/data/mediaData";
import { cn, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const media = mediaListings.find((m) => m.id === id);
  const [tccine, setTccine] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  if (!media) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Mídia não encontrada</h1>
          <Link href="/explorar" className="text-[#1e3a8a] hover:underline">Voltar</Link>
        </div>
      </div>
    );
  }

  const tccinePrice = 2500;
  const total = media.priceNumber + (tccine ? tccinePrice : 0);

  const handlePurchase = async () => {
    setProcessing(true);
    // TODO: integrate with POST /api/transactions/create-pix
    setTimeout(() => {
      toast.success("Pedido realizado! Aguarde a geração do PIX.");
      setProcessing(false);
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/midia/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1e3a8a] mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar para a mídia
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Finalizar compra</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Media Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">Resumo da mídia</h2>
              <div className="flex gap-4">
                <img src={media.image} alt={media.title} className="w-24 h-20 rounded-xl object-cover" />
                <div>
                  <p className="font-semibold text-gray-900">{media.title}</p>
                  <p className="text-sm text-gray-500">{media.type} · {media.location}</p>
                  <p className="text-lg font-bold text-[#1e3a8a] mt-2">{media.price}</p>
                </div>
              </div>
            </div>

            {/* TCCINE Option */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-2">Produção TCCINE</h2>
              <p className="text-sm text-gray-600 mb-4">
                Precisa de material publicitário? A TCCINE produz o criativo profissional para sua campanha.
              </p>
              <button
                onClick={() => setTccine(!tccine)}
                className={cn(
                  "w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all",
                  tccine ? "border-[#f97316] bg-[#f97316]/5" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", tccine ? "bg-[#f97316]" : "bg-gray-100")}>
                    <Video className={cn("h-5 w-5", tccine ? "text-white" : "text-gray-400")} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Contratar produção TCCINE</p>
                    <p className="text-sm text-gray-500">Vídeo/design profissional para a campanha</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#f97316]">+ {formatCurrency(tccinePrice)}</span>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", tccine ? "border-[#f97316] bg-[#f97316]" : "border-gray-300")}>
                    {tccine && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </div>
              </button>
            </div>

            {/* Payment info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">Pagamento</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Pagamento seguro via PIX</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Após confirmar, um QR Code PIX será gerado. O pagamento é processado pelo Mercado Pago com split automático.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary sticky */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Resumo do pedido</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Mídia</span><span className="font-medium">{formatCurrency(media.priceNumber)}</span></div>
                {tccine && <div className="flex justify-between"><span className="text-gray-600">Produção TCCINE</span><span className="font-medium text-[#f97316]">{formatCurrency(tccinePrice)}</span></div>}
                <div className="border-t pt-3 flex justify-between text-lg"><span className="font-semibold">Total</span><span className="font-bold text-[#1e3a8a]">{formatCurrency(total)}</span></div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={processing}
                className="w-full mt-6 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <><ShoppingCart className="h-5 w-5" /> Gerar PIX e pagar</>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Ao comprar, você concorda com os Termos de Uso
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
