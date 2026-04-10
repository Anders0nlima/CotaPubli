"use client";

import { MapPin } from "lucide-react";
import { useListingStore } from "@/stores/listingStore";

interface StepProps {
  onNext: () => void;
  onPublish?: () => void;
}

const estados = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export default function StepLocation({ onNext }: StepProps) {
  const { draft, setField } = useListingStore();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        Onde fica seu espaço publicitário?
      </h1>
      <p className="text-gray-500 mb-8">
        Informe o endereço ou localização do seu espaço. Anunciantes poderão encontrá-lo mais facilmente.
      </p>

      <div className="space-y-4">
        {/* Address search */}
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={draft.location_address}
            onChange={(e) => setField("location_address", e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:border-gray-900 transition-colors outline-none text-base"
            placeholder="Endereço ou referência do espaço"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cidade</label>
            <input
              type="text"
              value={draft.location_city}
              onChange={(e) => setField("location_city", e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-gray-900 transition-colors outline-none text-base"
              placeholder="Ex: São Paulo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
            <select
              value={draft.location_state}
              onChange={(e) => setField("location_state", e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-gray-900 transition-colors outline-none text-base bg-white"
            >
              <option value="">Selecione</option>
              {estados.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Map Placeholder */}
        <div className="mt-6 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 h-48 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {draft.location_city && draft.location_state
                ? `${draft.location_city}, ${draft.location_state}`
                : "A localização aparecerá aqui"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
