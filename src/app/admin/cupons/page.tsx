'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'univer2112@gmail.com';

interface Coupon {
  id: number;
  code: string;
  discount_percent: number;
  discount_fixed: number;
  min_purchase: number;
  used_count: number;
  active: boolean;
}

export default function AdminCuponsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  // Formulário
  const [code, setCode] = useState('');
  const [tipo, setTipo] = useState('percent'); // 'percent' ou 'fixed'
  const [valor, setValor] = useState('');
  const [minPurchase, setMinPurchase] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/admin/login');
        return;
      }
      fetchCoupons();
    };
    checkAuth();
  }, [router]);

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !valor) return;

    const payload = {
      code,
      discount_percent: tipo === 'percent' ? Number(valor) : null,
      discount_fixed: tipo === 'fixed' ? Number(valor) : null,
      min_purchase: minPurchase ? Number(minPurchase) : 0,
    };

    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setCode(''); setValor(''); setMinPurchase('');
      fetchCoupons(); // Recarrega a lista
      alert('Cupom criado com sucesso!');
    } else {
      alert('Erro ao criar cupom. Verifique se o código já existe.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apagar este cupom?')) return;
    
    const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCoupons(prev => prev.filter(c => c.id !== id));
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
            <Link href="/admin/produtos" className="text-sm text-gray-300 hover:text-white">Produtos</Link>
            <Link href="/admin/relatorios" className="text-sm text-gray-300 hover:text-white">Relatórios</Link>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="text-sm text-red-400 hover:text-red-300 font-bold">Sair</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* FORMULÁRIO DE CRIAÇÃO */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">Criar Novo Cupom</h1>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold mb-1">Código</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ex: BEMVINDO10" className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 uppercase" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tipo de Desconto</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2">
                <option value="percent">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Valor</label>
              <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder={tipo === 'percent' ? 'Ex: 10' : 'Ex: 20.00'} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Mín. Compra (Opcional)</label>
              <input type="number" step="0.01" value={minPurchase} onChange={e => setMinPurchase(e.target.value)} placeholder="Ex: 50.00" className="w-full border-2 border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="md:col-span-4 mt-2">
              <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-500 transition">Criar Cupom</button>
            </div>
          </form>
        </div>

        {/* LISTA DE CUPONS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Cupons Ativos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Código</th>
                  <th className="px-4 py-2">Desconto</th>
                  <th className="px-4 py-2">Mín. Compra</th>
                  <th className="px-4 py-2">Usos</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="border-b">
                    <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                    <td className="px-4 py-3">{c.discount_percent ? `${c.discount_percent}%` : `R$ ${Number(c.discount_fixed).toFixed(2)}`}</td>
                    <td className="px-4 py-3">{c.min_purchase > 0 ? `R$ ${Number(c.min_purchase).toFixed(2)}` : '-'}</td>
                    <td className="px-4 py-3">{c.used_count}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-xs font-bold">Apagar</button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum cupom criado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
