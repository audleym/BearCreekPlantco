"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  size: string;
  quantity: number;
};

const STORAGE_KEY = "bearcreek-cart";

// A tiny external store backed by localStorage, synced via useSyncExternalStore
// so reads/writes to the browser's localStorage stay outside of React's render.
let cartItems: CartItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore unavailable storage (private browsing, etc.)
  }
}

function getSnapshot(): CartItem[] {
  if (!hydrated) {
    cartItems = loadFromStorage();
    hydrated = true;
  }
  return cartItems;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next: CartItem[]) {
  cartItems = next;
  hydrated = true;
  saveToStorage(next);
  listeners.forEach((l) => l());
}

function addItemToStore(item: Omit<CartItem, "quantity">, quantity: number) {
  const current = getSnapshot();
  const existing = current.find((i) => i.productId === item.productId);
  const next = existing
    ? current.map((i) =>
        i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i
      )
    : [...current, { ...item, quantity }];
  commit(next);
}

function removeItemFromStore(productId: string) {
  commit(getSnapshot().filter((i) => i.productId !== productId));
}

function setQuantityInStore(productId: string, quantity: number) {
  const current = getSnapshot();
  const next =
    quantity <= 0
      ? current.filter((i) => i.productId !== productId)
      : current.map((i) => (i.productId === productId ? { ...i, quantity } : i));
  commit(next);
}

function clearStore() {
  commit([]);
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalCents: number;
  totalCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const { totalCents, totalCount } = useMemo(
    () =>
      items.reduce(
        (acc, i) => ({
          totalCents: acc.totalCents + i.priceCents * i.quantity,
          totalCount: acc.totalCount + i.quantity,
        }),
        { totalCents: 0, totalCount: 0 }
      ),
    [items]
  );

  const value: CartContextValue = {
    items,
    addItem: (item, quantity = 1) => addItemToStore(item, quantity),
    removeItem: removeItemFromStore,
    setQuantity: setQuantityInStore,
    clear: clearStore,
    totalCents,
    totalCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
