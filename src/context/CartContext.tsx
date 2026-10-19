'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartItem {
  id: number;
  ref: string;
  name: string;
  price: number;
  image_url: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number, size: string, color: string) => void;
  updateQuantity: (id: number, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else {
          localStorage.removeItem('cart');
        }
      }
    } catch (e) {
      console.error('Erro ao carregar carrinho:', e);
      localStorage.removeItem('cart');
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, loaded]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const idx = safePrev.findIndex(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );
      if (idx >= 0) {
        const novo = [...safePrev];
        novo[idx].quantity += item.quantity;
        return novo;
      }
      return [...safePrev, item];
    });
  };

  const removeItem = (id: number, size: string, color: string) => {
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.filter(
        (i) => !(i.id === id && i.size === size && i.color === color)
      );
    });
  };

  const updateQuantity = (id: number, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size, color);
      return;
    }
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map((i) =>
        i.id === id && i.size === size && i.color === color
          ? { ...i, quantity }
          : i
      );
    });
  };

  const clearCart = () => setItems([]);

  const safeItems = Array.isArray(items) ? items : [];
  const total = safeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = safeItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items: safeItems, addItem, removeItem, updateQuantity, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de CartProvider');
  return ctx;
}
