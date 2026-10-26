'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export interface Product {
  id: number;
  ref: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image_url: string;
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos');

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('id');

      if (error) {
        console.error('Erro ao buscar produtos:', error);
      } else {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Carregando camisetas...
      </div>
    );
  }

  const categorias = ['todos', '29.90', '34.90', '39.90', '49.90', 'kit'];
  const filtrados =
    categoriaAtiva === 'todos'
      ? products
      : products.filter((p) => p.category === categoriaAtiva);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-5 py-2 rounded-full border-2 font-semibold transition ${
              categoriaAtiva === cat
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            {cat === 'todos' ? 'Todos' : cat === 'kit' ? 'Kit' : `R$ ${cat}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtrados.map((product) => (
          <Link
            key={product.id}
            href={`/produto/${product.ref}`}
            className="border rounded-lg overflow-hidden hover:shadow-xl transition group cursor-pointer block"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              {product.featured && (
                <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  DESTAQUE
                </span>
              )}
            </div>
            <div className="p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                REF {product.ref}
              </span>
              <h3 className="font-bold text-lg mt-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {product.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-2xl font-bold">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold group-hover:bg-orange-500 transition">
                  Ver produto
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
