'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

interface Product {
  id: number;
  ref: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image_url: string;
  sizes: string[];
  sizes_stock: Record<string, number>;
  colors: string[];
  stock: number;
}

function ProdutoConteudo() {
  const params = useParams();
  const router = useRouter();
  const ref = params.ref as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('ref', ref)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setProduct(data as Product);
      if (data.colors?.length) setSelectedColor(data.colors[0]);
      
      // Seleciona automaticamente o primeiro tamanho que tiver estoque
      if (data.sizes?.length && data.sizes_stock) {
        const primeiroDisponivel = data.sizes.find((s: string) => (data.sizes_stock[s] || 0) > 0);
        if (primeiroDisponivel) setSelectedSize(primeiroDisponivel);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [ref]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      alert('Escolha um tamanho disponível');
      return;
    }

    addItem({
      id: product.id,
      ref: product.ref,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando produto...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Produto não encontrado.</div>;

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-black mb-6">&larr; Voltar</button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in" onMouseMove={handleMouseMove} onMouseLeave={() => setZoom({ active: false, x: 50, y: 50 })}>
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-200" style={{ transform: zoom.active ? 'scale(2)' : 'scale(1)', transformOrigin: `${zoom.x}% ${zoom.y}%` }} />
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-widest">REF {product.ref}</span>
            <h1 className="text-3xl lg:text-4xl font-black mt-2">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-orange-500">R$ {product.price.toFixed(2).replace('.', ',')}</span>
            </div>
            <p className="mt-6 text-gray-700 leading-relaxed">{product.description}</p>

            {/* CORES */}
            {product.colors?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase mb-2">Cor: <span className="text-gray-500">{selectedColor}</span></h3>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition ${selectedColor === color ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAMANHOS COM ESTOQUE INDIVIDUAL */}
            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase mb-2">Tamanho</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => {
                    const estoqueDesteTamanho = product.sizes_stock?.[size] ?? 0;
                    const esgotado = estoqueDesteTamanho <= 0;

                    return (
                      <button
                        key={size}
                        disabled={esgotado}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-lg border-2 font-semibold transition relative overflow-hidden ${
                          esgotado
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : selectedSize === size
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                      >
                        {size}
                        {esgotado && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[2px] bg-gray-400 rotate-45 transform origin-center"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && (
                  <p className="text-xs text-gray-500 mt-2">
                    {product.sizes_stock?.[selectedSize] > 0 
                      ? `Restam apenas ${product.sizes_stock[selectedSize]} unidades` 
                      : 'Este tamanho está esgotado'}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase mb-2">Quantidade</h3>
              <div className="inline-flex items-center border-2 border-gray-300 rounded-lg">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 text-xl font-bold hover:bg-gray-100">-</button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 text-xl font-bold hover:bg-gray-100">+</button>
              </div>
            </div>

            <button onClick={handleAddToCart} disabled={!selectedSize} className={`mt-8 py-4 px-6 rounded-lg font-bold text-lg transition ${added ? 'bg-green-500 text-white' : !selectedSize ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-black text-white hover:bg-orange-500'}`}>
              {added ? 'Adicionado ao carrinho!' : !selectedSize ? 'Escolha um tamanho' : 'Adicionar ao carrinho'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProdutoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <ProdutoConteudo />
    </Suspense>
  );
}
