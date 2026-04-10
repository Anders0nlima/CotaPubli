import { create } from "zustand";

export interface ListingDraft {
  id?: string;
  media_type: string;
  location_address: string;
  location_city: string;
  location_state: string;
  location_lat?: number;
  location_lng?: number;
  photos: string[];
  title: string;
  description: string;
  price: number | null;
  wizard_step: number;
}

interface ListingStore {
  draft: ListingDraft;
  listingId: string | null;
  isLoading: boolean;
  setField: <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => void;
  setDraft: (draft: Partial<ListingDraft>) => void;
  setListingId: (id: string) => void;
  setStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  loadFromServer: (serverDraft: any) => void;
}

const initialDraft: ListingDraft = {
  media_type: "",
  location_address: "",
  location_city: "",
  location_state: "",
  photos: [],
  title: "",
  description: "",
  price: null,
  wizard_step: 0,
};

export const useListingStore = create<ListingStore>((set) => ({
  draft: { ...initialDraft },
  listingId: null,
  isLoading: false,

  setField: (key, value) =>
    set((state) => ({
      draft: { ...state.draft, [key]: value },
    })),

  setDraft: (partial) =>
    set((state) => ({
      draft: { ...state.draft, ...partial },
    })),

  setListingId: (id) => set({ listingId: id }),

  setStep: (step) =>
    set((state) => ({
      draft: { ...state.draft, wizard_step: step },
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({
      draft: { ...initialDraft },
      listingId: null,
      isLoading: false,
    }),

  loadFromServer: (serverDraft: any) =>
    set({
      listingId: serverDraft.id,
      draft: {
        id: serverDraft.id,
        media_type: serverDraft.media_type || "",
        location_address: serverDraft.location_address || "",
        location_city: serverDraft.location_city || "",
        location_state: serverDraft.location_state || "",
        location_lat: serverDraft.location_lat,
        location_lng: serverDraft.location_lng,
        photos: serverDraft.media_urls || [],
        title: serverDraft.title || "",
        description: serverDraft.description || "",
        price: serverDraft.price ? Number(serverDraft.price) : null,
        wizard_step: serverDraft.wizard_step || 0,
      },
    }),
}));
