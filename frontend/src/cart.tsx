import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mediaUrl } from './api';

export type CartProduct = {
  id: string;
  name: string;
  weight: string;
  price: number;
  mrp: number;
  image: string;
  department?: string;
  category_id?: string;
  brand_id?: string;
};

export type CartItem = CartProduct & { qty: number };

type CartContextType = {
  items: CartItem[];
  add: (p: CartProduct, origin?: { x: number; y: number }) => void;
  lastAdded: { product: CartProduct; origin?: { x: number; y: number }; revision: number } | null;
  remove: (id: string) => void;
  clear: () => void;
  qtyOf: (id: string) => number;
  totalItems: number;
  totalPrice: number;
  totalMrp: number;
};

const CartContext = createContext<CartContextType | null>(null);
const KEY = "onelatur.cart.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartContextType['lastAdded']>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v) {
        try { setItems(JSON.parse(v).map((item: CartItem) => item.id === 'p6' ? { ...item, image: mediaUrl('snacks') } : item)); } catch {}
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = (p: CartProduct, origin?: { x: number; y: number }) => {
    setLastAdded(prev => ({ product: p, origin, revision: (prev?.revision || 0) + 1 }));
    setItems((prev) => {
      const ex = prev.find((i) => i.id === p.id);
      if (ex) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const remove = (id: string) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.id === id);
      if (!ex) return prev;
      if (ex.qty <= 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i));
    });
  };
  const clear = () => setItems([]);
  const qtyOf = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;
  const totalItems = items.reduce((a, b) => a + b.qty, 0);
  const totalPrice = items.reduce((a, b) => a + b.qty * b.price, 0);
  const totalMrp = items.reduce((a, b) => a + b.qty * b.mrp, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, clear, qtyOf, totalItems, totalPrice, totalMrp, lastAdded }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
