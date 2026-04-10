"use client";

import { DollarSign } from "lucide-react";
import { useListingStore } from "@/stores/listingStore";

interface StepProps {
  onNext: () => void;
  onPublish?: () => void;
}

export default function StepPrice({ onNext }: StepProps) {
  const { draft, setField } = useListingStore();

  const handlePriceChange = (value: string) => {
    const num = parseFloat(value);
    setField("price", isNaN(num) ? null : num);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        Agora, defina o preço
      </h1>
      <p className="text-gray-500 mb-8">
        Você pode alterar o valor a qualquer momento. Dica: pesquise preços similares na plataforma antes de decidir.
      </p>

      <div className="max-w-md mx-auto">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-6">
            <span className="text-3xl font-bold text-gray-400">R$</span>
          </div>
          <input
            type="number"
            value={draft.price ?? ""}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="w-full pl-20 pr-6 py-8 border-2 border-gray-300 rounded-2xl focus:border-gray-900 transition-colors outline-none text-center text-5xl font-bold text-gray-900"
            placeholder="0"
            min={0}
            step={100}
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Valor mensal do espaço publicitário
        </p>

        {/* Quick price suggestions */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {[500, 1000, 2500, 5000, 10000, 25000].map((price) => (
            <button
              key={price}
              onClick={() => setField("price", price)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                draft.price === price
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              R$ {price.toLocaleString("pt-BR")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
