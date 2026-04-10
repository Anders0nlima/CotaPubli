"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Upload } from "lucide-react";
import { useListingStore } from "@/stores/listingStore";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface StepProps {
  onNext: () => void;
  onPublish?: () => void;
}

export default function StepPhotos({ onNext }: StepProps) {
  const { draft, setField } = useListingStore();
  const { supabaseUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (!supabaseUser) {
      toast.error("Você precisa estar logado");
      return;
    }

    const validFiles = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} não é uma imagem`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} excede 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of validFiles) {
      const ext = file.name.split(".").pop();
      const path = `${supabaseUser.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        toast.error(`Erro ao enviar ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("listing-photos")
        .getPublicUrl(path);

      if (urlData?.publicUrl) {
        newUrls.push(urlData.publicUrl);
      }
    }

    if (newUrls.length > 0) {
      setField("photos", [...draft.photos, ...newUrls]);
      toast.success(`${newUrls.length} foto(s) enviada(s)`);
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (index: number) => {
    setField(
      "photos",
      draft.photos.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        Adicione fotos do seu espaço publicitário
      </h1>
      <p className="text-gray-500 mb-8">
        Fotos de qualidade ajudam anunciantes a entenderem seu espaço. Você pode adicionar mais fotos depois.
      </p>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-[#1e3a8a] bg-[#1e3a8a]/5"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="py-8">
            <div className="animate-spin h-10 w-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Enviando fotos...</p>
          </div>
        ) : (
          <div className="py-8">
            <div className="mx-auto w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <ImagePlus className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">Arraste suas fotos aqui</p>
            <p className="text-sm text-gray-500">ou clique para selecionar</p>
            <p className="text-xs text-gray-400 mt-2">PNG, JPG ou WebP. Máximo 10MB por foto.</p>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {draft.photos.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {draft.photos.map((url, i) => (
            <div key={i} className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100">
              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded-md text-xs font-medium text-gray-900">
                  Capa
                </span>
              )}
            </div>
          ))}

          {/* Add more button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Upload className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-500">Adicionar mais</span>
          </button>
        </div>
      )}
    </div>
  );
}
