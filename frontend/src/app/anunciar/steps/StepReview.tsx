"use client";

import { CheckCircle, MapPin, ImageIcon, DollarSign, Tag, FileText } from "lucide-react";
import { useListingStore } from "@/stores/listingStore";
import { formatCurrency } from "@/lib/utils";

interface StepProps {
  onNext: () => void;
  onPublish?: () => void;
}

const categoryLabels: Record<string, string> = {
  outdoor: "Outdoor",
  digital: "Painel Digital / LED",
  tv: "TV",
  radio: "Rádio",
  influencer: "Influenciador Digital",
  bus_stop: "Parada de Ônibus",
};

export default function StepReview({ onPublish }: StepProps) {
  const { draft } = useListingStore();

  const items = [
    {
      icon: Tag,
      label: "Categoria",
      value: categoryLabels[draft.media_type] || "—",
      ok: !!draft.media_type,
    },
    {
      icon: MapPin,
      label: "Localização",
      value: draft.location_city && draft.location_state
        ? `${draft.location_address ? draft.location_address + ", " : ""}${draft.location_city} - ${draft.location_state}`
        : "—",
      ok: !!(draft.location_city && draft.location_state),
    },
    {
      icon: ImageIcon,
      label: "Fotos",
      value: `${draft.photos.length} foto(s)`,
      ok: draft.photos.length > 0,
    },
    {
      icon: FileText,
      label: "Título",
      value: draft.title || "—",
      ok: !!draft.title,
    },
    {
      icon: DollarSign,
      label: "Preço",
      value: draft.price ? formatCurrency(draft.price) : "—",
      ok: !!draft.price,
    },
  ];

  const allComplete = items.every((item) => item.ok);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        Revise seu anúncio
      </h1>
      <p className="text-gray-500 mb-8">
        Confira todas as informações antes de enviar para aprovação. Após a publicação, nossa equipe revisará seu anúncio.
      </p>

      {/* Review Grid */}
      <div className="space-y-4 mb-8">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className={`p-2.5 rounded-lg ${item.ok ? "bg-green-100" : "bg-gray-200"}`}>
                <Icon className={`h-5 w-5 ${item.ok ? "text-green-600" : "text-gray-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{item.value}</p>
              </div>
              {item.ok && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Photos Preview */}
      {draft.photos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Prévia das fotos</h3>
          <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
            {draft.photos.slice(0, 3).map((url, i) => (
              <div key={i} className={`aspect-video bg-gray-100 ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description preview */}
      {draft.description && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Descrição</h3>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
            {draft.description}
          </p>
        </div>
      )}

      {!allComplete && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠️ Preencha todos os campos obrigatórios (categoria, localização, título e preço) para poder publicar.
        </div>
      )}
    </div>
  );
}
