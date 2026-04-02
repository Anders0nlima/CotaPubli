"use client";

import Link from "next/link";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { formatCurrency } from "@/lib/utils";

export default function CarrinhoPage() {
  // TODO: integrate with cart state management
  const cartItems: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Meu Carrinho</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-6">Explore nossas mídias e encontre o espaço ideal para sua campanha.</p>
            <Link href="/explorar" className="inline-flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Explorar mídias <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div>
            {/* Cart items would go here */}
          </div>
        )}
      </div>
    </div>
  );
}
