"use client";

import { Building2, Camera, DollarSign } from "lucide-react";

interface StepProps {
  onNext: () => void;
  onPublish?: () => void;
}

export default function StepOverview({ onNext }: StepProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
      {/* Left */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          É fácil anunciar no CotaPubli
        </h1>
      </div>

      {/* Right — 3 Steps */}
      <div className="space-y-8">
        {[
          {
            num: 1,
            icon: Building2,
            title: "Descreva seu espaço",
            desc: "Compartilhe informações básicas como a categoria, localização e detalhes do seu espaço publicitário.",
          },
          {
            num: 2,
            icon: Camera,
            title: "Faça com que se destaque",
            desc: "Adicione fotos do seu espaço, além de um título e uma descrição. Nós ajudaremos você.",
          },
          {
            num: 3,
            icon: DollarSign,
            title: "Concluir e publicar",
            desc: "Escolha um preço, verifique algumas informações e publique seu anúncio.",
          },
        ].map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <span className="text-lg font-semibold text-gray-900">{step.num}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[#1e3a8a]/10 to-[#f97316]/10 flex items-center justify-center">
                <Icon className="h-7 w-7 text-[#1e3a8a]" />
              </div>
            </div>
          );
        })}

        <button
          onClick={onNext}
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#e11d48] to-[#f43f5e] text-white rounded-xl font-semibold text-base hover:from-[#be123c] hover:to-[#e11d48] transition-all shadow-lg shadow-rose-500/25 mt-4"
        >
          Começar
        </button>
      </div>
    </div>
  );
}
