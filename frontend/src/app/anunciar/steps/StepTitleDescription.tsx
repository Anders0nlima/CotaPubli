"use client";

import { useListingStore } from "@/stores/listingStore";

interface StepProps {
  onNext: () => void;
  onPublish?: () => void;
}

export default function StepTitleDescription({ onNext }: StepProps) {
  const { draft, setField } = useListingStore();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        Agora, dê um título ao seu espaço
      </h1>
      <p className="text-gray-500 mb-8">
        Títulos curtos e objetivos chamam mais atenção. Você sempre poderá alterar depois.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Título do anúncio</label>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setField("title", e.target.value)}
            maxLength={120}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-gray-900 transition-colors outline-none text-lg"
            placeholder="Ex: Painel LED Premium - Avenida Paulista"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{draft.title.length}/120</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <textarea
            value={draft.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={5}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-gray-900 transition-colors outline-none text-base resize-none"
            placeholder="Descreva os diferenciais do seu espaço: dimensões, visibilidade, fluxo de pessoas, horários de exibição..."
          />
        </div>
      </div>
    </div>
  );
}
