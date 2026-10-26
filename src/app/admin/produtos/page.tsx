'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'univer2112@gmail.com';

interface Product {
  id: number;
  ref: string;
  name: string;
  price: number;
  sizes: string[];
  sizes_stock: Record<string, number>;
  active: boolean;
}

export default function AdminProdutosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Estados de ediÃ§Ã£o
  const [editPrice, setEditPrice] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editStock, setEditStock] = useState<Record<string, number>>({});
  const [editSizesText, setEditSizesText] = useState(''); // Novo campo para editar os tamanhos

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/admin/login');
        return;
      }
      fetchProducts();
    };
    checkAuth();
  }, [router]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id');
    if (data) setProducts(data);
    setLoading(false);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditPrice(p.price.toString());
    setEditActive(p.active);
    setEditStock(p.sizes_stock ? { ...p.sizes_stock } : {});
    setEditSizesText(p.sizes ? p.sizes.join(', ') : ''); // Preenche com os tamanhos atuais
  };

  const handleStockChange = (size: string, value: string) => {
    setEditStock(prev => ({ ...prev, [size]: Number(value) }));
  };

  const saveEdit = async (id: number) => {
    try {
      // Processa os tamanhos que o admin digitou
      const novosTamanhos = editSizesText
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(s => s !== '');

      // ReconstrÃ³i o estoque para manter os valores dos tamanhos existentes e zerar os novos
      const novoEstoque: Record<string, number> = {};
      novosTamanhos.forEach(tamanho => {
        novoEstoque[tamanho] = editStock[tamanho] || 0;
      });

      const res = await fetch('/api/admin/update-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          price: Number(editPrice),
          active: editActive,
          sizes: novosTamanhos,
          sizes_stock: novoEstoque
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar');
      
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, price: Number(editPrice), active: editActive, sizes: novosTamanhos, sizes_stock: novoEstoque } : p
      ));
      setEditingId(null);
    } catch (err) {
      alert('Erro ao salvar as alteraÃ§Ãµes.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-black text-white py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/admin/painel" className="font-black text-xl">LOJA Admin</Link>
          <div className="flex gap-4">
            <Link href="/admin/painel" className="text-sm text-gray-300 hover:text-white">Pedidos</Link>
            <Link href="/admin/relatorios" className="text-sm text-gray-400 hover:text-white">RelatÃ³rios</Link>
            <Link href="/admin/cupons" className="text-sm text-gray-400 hover:text-white">Cupons</Link>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="text-sm text-red-400 hover:text-red-300 font-bold">Sair</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Gerenciar Produtos e Estoque</h1>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600">
                  <th className="px-4 py-3">REF</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">PreÃ§o (R$)</th>
                  <th className="px-4 py-3">Tamanhos DisponÃ­veis</th>
                  <th className="px-4 py-3">Estoque por Tamanho</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{p.ref}</td>
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    
                    <td className="px-4 py-3">
                      {editingId === p.id ? (
                        <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-20 border rounded px-2 py-1" />
                      ) : (
                        `R$ ${p.price.toFixed(2).replace('.', ',')}`
                      )}
                    </td>

                    {/* CAMPO DE EDITAR TAMANHOS */}
                    <td className="px-4 py-3">
                      {editingId === p.id ? (
                        <input 
                          type="text" 
                          value={editSizesText} 
                          onChange={e => setEditSizesText(e.target.value)} 
                          placeholder="Ex: P, M, G"
                          className="w-32 border rounded px-2 py-1 text-xs" 
                        />
                      ) : (
                        <span className="text-xs">{p.sizes?.join(', ')}</span>
                      )}
                    </td>

                    {/* ESTOQUE POR TAMANHO */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {/* Mostra o estoque apenas para os tamanhos atuais */}
                        {p.sizes?.map(size => (
                          <div key={size} className="flex flex-col items-center">
                            <span className="text-xs font-bold mb-1">{size}</span>
                            {editingId === p.id ? (
                              <input 
                                type="number" 
                                value={editStock[size] || 0} 
                                onChange={e => handleStockChange(size, e.target.value)} 
                                className="w-14 border rounded px-1 py-1 text-center text-sm" 
                              />
                            ) : (
                              <span className={`px-2 py-1 rounded text-xs font-bold ${(p.sizes_stock?.[size] || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {p.sizes_stock?.[size] || 0}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {editingId === p.id ? (
                        <select value={editActive ? 'true' : 'false'} onChange={e => setEditActive(e.target.value === 'true')} className="border rounded px-2 py-1 text-xs">
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {p.active ? 'Ativo' : 'Inativo'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === p.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(p.id)} className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600">Salvar</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-300 text-black px-3 py-1 rounded text-xs font-bold hover:bg-gray-400">Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(p)} className="bg-black text-white px-3 py-1 rounded text-xs font-bold hover:bg-orange-500">Editar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
