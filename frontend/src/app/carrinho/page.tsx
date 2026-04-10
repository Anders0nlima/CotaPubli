"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, ArrowRight, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { useCartStore } from "@/stores/cartStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function CarrinhoPage() {
  const { items, removeItem, clearCart, getTotals } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const { total, count } = getTotals();

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        items: items.map(item => ({ media_card_id: item.id }))
      };
      
      const response = await api.post("/orders/checkout", payload);
      
      if (response.status === 201) {
        setSuccess(true);
        clearCart();
        toast.success("Pedido concluído com sucesso!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao processar o checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meu Carrinho</h1>

        {success ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-emerald-100 text-center">
            <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Compra MOCK aprovada!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Seu pedido foi processado (ambiente de testes). As cotas foram movidas e o estoque atualizado com sucesso.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/dashboard/minhas-compras" className="inline-flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Ver minhas compras
              </Link>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-6">Explore nossas mídias e encontre o espaço ideal para sua campanha.</p>
            <Link href="/explorar" className="inline-flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Explorar mídias <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-[#1e3a8a] bg-[#1e3a8a]/10 px-2 py-1 rounded-full mb-1 inline-block">
                          {item.type}
                        </span>
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight mt-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Vendedor: {item.seller}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="Remover"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-3">
                      <p className="text-lg font-bold text-[#f97316]">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Resumo do Pedido</h3>
                
                <div className="space-y-3 mb-6 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({count} itens)</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxas</span>
                    <span>Calculado no Checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-[#1e3a8a]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right">Em ambiente de testes mock</p>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-70 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-all shadow-md"
                >
                  {isProcessing ? "Processando..." : "Finalizar Compra / Mock"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
