'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, total, clearCart, count } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-3xl font-bold">Seu carrinho está vazio</h1>
        <p className="text-gray-500">Adicione algumas camisetas antes de finalizar.</p>
        <Link
          href="/"
          className="mt-4 bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-500 transition"
        >
          Voltar para a loja
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-black mb-8">Carrinho ({count})</h1>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.size}-${item.color}`}
              className="flex gap-4 border rounded-lg p-4"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="w-24 h-32 object-cover rounded"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-gray-500 uppercase">
                    REF {item.ref}
                  </span>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.color} · Tamanho {item.size}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="inline-flex items-center border rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.color, item.quantity - 1)
                      }
                      className="w-8 h-8 font-bold hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.color, item.quantity + 1)
                      }
                      className="w-8 h-8 font-bold hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                    <button
                      onClick={() => removeItem(item.id, item.size, item.color)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between items-center text-xl font-bold mb-2">
            <span>Subtotal</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Frete calculado no checkout
          </p>

          <Link
            href="/checkout"
            className="block w-full text-center bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-500 transition"
          >
            Finalizar compra
          </Link>

          <button
            onClick={clearCart}
            className="w-full mt-3 text-sm text-gray-500 hover:text-red-500"
          >
            Limpar carrinho
          </button>
        </div>
      </div>
    </main>
  );
}
