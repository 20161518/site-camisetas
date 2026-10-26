'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

export default function CartButton() {
  const { count, total } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Só renderiza depois que o componente estiver montado no navegador
  if (!mounted || count === 0) return null;

  return (
    <Link
      href="/carrinho"
      className="fixed bottom-6 right-6 z-50 bg-black text-white rounded-full shadow-2xl px-5 py-4 flex items-center gap-3 hover:bg-orange-500 transition"
    >
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      </div>
      <span className="font-bold text-sm hidden sm:inline">
        R$ {total.toFixed(2).replace('.', ',')}
      </span>
    </Link>
  );
}
