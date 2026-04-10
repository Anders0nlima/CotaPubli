"use client";

import { Building2, Monitor, Tv, Radio, Users, MapPin } from "lucide-react";
import { useListingStore } from "@/stores/listingStore";
import { cn } from "@/lib/utils";

interface StepProps {
  onNext: () => void;
  onPublish?: () => void;
}

const categories = [
  { value: "outdoor", icon: Building2, label: "Outdoor" },
  { value: "digital", icon: Monitor, label: "Painel Digital / LED" },
  { value: "tv", icon: Tv, label: "TV" },
  { value: "radio", icon: Radio, label: "Rádio" },
  { value: "influencer", icon: Users, label: "Influenciador Digital" },
  { value: "bus_stop", icon: MapPin, label: "Parada de Ônibus" },
];

export default function StepCategory({ onNext }: StepProps) {
  const { draft, setField } = useListingStore();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        Qual das seguintes opções descreve melhor seu espaço?
      </h1>
      <p className="text-gray-500 mb-8">
        Selecione a categoria que melhor representa o tipo de mídia que você oferece.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = draft.media_type === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setField("media_type", cat.value)}
              className={cn(
                "flex flex-col items-start p-5 border-2 rounded-xl transition-all text-left group hover:border-gray-900",
                isSelected
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200"
              )}
            >
              <Icon
                className={cn(
                  "h-7 w-7 mb-3 transition-colors",
                  isSelected ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <span className="font-medium text-gray-900 text-sm">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
