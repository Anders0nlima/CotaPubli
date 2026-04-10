import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // media_card_id
  title: string;
  price: number;
  image: string;
  type: string;
  seller: string;
  tccine_requested?: boolean;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotals: () => { total: number; count: number };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          // Avoid duplicate items (one unique ad per card for MVP)
          if (state.items.find(i => i.id === item.id)) return state;
          return { items: [...state.items, item] };
        });
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
      clearCart: () => set({ items: [] }),
      getTotals: () => {
        const items = get().items;
        return {
          total: items.reduce((acc, curr) => acc + curr.price, 0),
          count: items.length,
        };
      },
    }),
    {
      name: 'cotapubli-cart',
    }
  )
);
