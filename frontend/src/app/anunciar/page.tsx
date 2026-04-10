"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useListingStore } from "@/stores/listingStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

// Steps
import StepOverview from "./steps/StepOverview";
import StepCategory from "./steps/StepCategory";
import StepLocation from "./steps/StepLocation";
import StepPhotos from "./steps/StepPhotos";
import StepTitleDescription from "./steps/StepTitleDescription";
import StepPrice from "./steps/StepPrice";
import StepReview from "./steps/StepReview";

const TOTAL_STEPS = 7;

const STEP_COMPONENTS = [
  StepOverview,      // 0 - Landing "É fácil anunciar"
  StepCategory,      // 1 - Tipo de espaço
  StepLocation,      // 2 - Localização
  StepPhotos,        // 3 - Upload de fotos
  StepTitleDescription, // 4 - Título e descrição
  StepPrice,         // 5 - Preço
  StepReview,        // 6 - Revisão final
];

export default function AnunciarPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshProfile } = useAuth();
  const {
    draft,
    listingId,
    isLoading,
    setStep,
    setListingId,
    setLoading,
    reset,
    loadFromServer,
  } = useListingStore();

  const [initialized, setInitialized] = useState(false);

  // Check for existing drafts on mount, but ONLY after auth is resolved
  useEffect(() => {
    if (authLoading) return; // Wait for AuthContext
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    const loadDraft = async () => {
      try {
        const { data } = await api.get("/listings/my/drafts");
        if (data && data.length > 0) {
          // Load the most recent draft
          loadFromServer(data[0]);
        }
      } catch (err: any) {
        console.warn("Nenhum rascunho encontrado ou erro de sincronismo");
      } finally {
        setInitialized(true);
      }
    };
    loadDraft();

  }, [authLoading, isAuthenticated, user, router]);

  const currentStep = draft.wizard_step;
  const StepComponent = STEP_COMPONENTS[currentStep] || StepOverview;

  // Save draft to server (from step 1+, once we have a category)
  const saveDraft = async () => {
    setLoading(true);
    try {
      const payload = {
        media_type: draft.media_type || undefined,
        title: draft.title || undefined,
        description: draft.description || undefined,
        price: draft.price || undefined,
        location_address: draft.location_address || undefined,
        location_city: draft.location_city || undefined,
        location_state: draft.location_state || undefined,
        media_urls: draft.photos.length > 0 ? draft.photos : undefined,
        wizard_step: draft.wizard_step,
      };

      if (listingId) {
        await api.patch(`/listings/${listingId}`, payload);
      } else {
        const { data } = await api.post("/listings", payload);
        if (data?.id) setListingId(data.id);
      }
    } catch (err: any) {
      console.error("Failed to save draft:", err);
      toast.error("Falha ao salvar rascunho. O painel deve criar uma conexão válida.");
      throw err; // Re-throw to inform caller
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep >= TOTAL_STEPS - 1) return;

    // Auto-save from step 1 onwards (once we have category)
    if (currentStep >= 1) {
      try {
        await saveDraft();
      } catch (err) {
        // Stop execution, don't advance step!
        return;
      }
    }

    const nextStep = currentStep + 1;
    setStep(nextStep);
  };

  const handleBack = () => {
    if (currentStep <= 0) return;
    setStep(currentStep - 1);
  };

  const handleSaveAndExit = async () => {
    if (currentStep >= 1) {
      await saveDraft();
      toast.success("Rascunho salvo!");
    }
    reset();
    router.push("/");
  };

  const handlePublish = async () => {
    if (!listingId) {
      toast.error("Nenhum rascunho para publicar");
      return;
    }

    setLoading(true);
    try {
      // Save final state first
      await saveDraft();
      // Then publish
      await api.post(`/listings/${listingId}/publish`);
      toast.success("Anúncio enviado para aprovação! 🎉");
      await refreshProfile();
      reset();
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao publicar");
    } finally {
      setLoading(false);
    }
  };

  // Progress bar segments
  const progressSegments = 3; // 3 main stages
  const getSegmentProgress = () => {
    if (currentStep <= 0) return [0, 0, 0];
    if (currentStep <= 2) return [((currentStep) / 2) * 100, 0, 0];
    if (currentStep <= 4) return [100, ((currentStep - 2) / 2) * 100, 0];
    return [100, 100, ((currentStep - 4) / 2) * 100];
  };
  const segments = getSegmentProgress();

  if (authLoading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full mb-4" />
          <p className="text-gray-500 text-sm font-medium">Sincronizando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {currentStep >= 1 && (
            <>
              <button
                onClick={handleSaveAndExit}
                className="px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Salvar e sair
              </button>
            </>
          )}
          {currentStep === 0 && (
            <button
              onClick={() => { reset(); router.push("/"); }}
              className="px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sair
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
          <StepComponent
            onNext={handleNext}
            onPublish={handlePublish}
          />
        </div>
      </main>

      {/* Bottom Bar */}
      {currentStep > 0 && (
        <footer className="border-t border-gray-100">
          {/* Progress Bar */}
          <div className="flex gap-2 px-0">
            {segments.map((pct, i) => (
              <div key={i} className="flex-1 h-1 bg-gray-200">
                <div
                  className="h-full bg-gray-900 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-6 lg:px-12 py-4">
            <button
              onClick={handleBack}
              className="text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
            >
              Voltar
            </button>

            {currentStep < TOTAL_STEPS - 1 ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Salvando...
                  </div>
                ) : (
                  "Avançar"
                )}
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-[#e11d48] to-[#f43f5e] text-white rounded-lg font-semibold text-sm hover:from-[#be123c] hover:to-[#e11d48] transition-all shadow-lg disabled:opacity-50"
              >
                {isLoading ? "Publicando..." : "Publicar anúncio"}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
