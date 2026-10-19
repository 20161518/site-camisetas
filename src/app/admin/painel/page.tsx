'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'univer2112@gmail.com';

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_city: string;
  total_amount: number;
  status: string;
  tracking_code: string;
  customer_notes: string;
  created_at: string;
}

export default function AdminPainelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/admin/login');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const atualizarStatus = async (id: number, novoStatus: string) => {
    let tracking = '';
    if (novoStatus === 'shipped') {
      tracking = window.prompt('Digite o código de rastreio (opcional):') || '';
    }
    
    const res = await fetch('/api/admin/update-order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: novoStatus, tracking_code: tracking }),
    });

    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: novoStatus, tracking_code: tracking } : o))
      );
    } else {
      alert('Erro ao atualizar o status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Carregando painel...
      </div>
    );
  }

  const filtrados =
    filtro === 'todos' ? orders : orders.filter((o) => o.status === filtro);

  const totalVendas = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-black text-white py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/admin/painel" className="font-black text-xl">
            ONSTAGE Admin
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin/produtos" className="text-sm text-gray-400 hover:text-white">Produtos</Link>
            <Link href="/admin/relatorios" className="text-sm text-gray-400 hover:text-white">Relatórios</Link>
            <Link href="/admin/cupons" className="text-sm text-gray-400 hover:text-white">Cupons</Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-white">Ver Loja</Link>
            <button onClick={handleLogout} className="text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500 mb-1">Total de Pedidos</p>
            <p className="text-3xl font-black">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500 mb-1">Vendas Confirmadas</p>
            <p className="text-3xl font-black text-green-600">
              R$ {totalVendas.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500 mb-1">Pendentes</p>
            <p className="text-3xl font-black text-orange-500">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-xl font-bold">Pedidos</h2>
            <div className="flex gap-2 flex-wrap">
              {['todos', 'pending', 'paid', 'shipped', 'delivered', 'canceled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltro(s)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border-2 transition ${
                    filtro === s
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-gray-300 hover:border-black'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {filtrados.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum pedido encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Cliente</th>
                    <th className="px-3 py-2">Cidade</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Rastreio</th>
                    <th className="px-3 py-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((o) => (
                    <tr key={o.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-3 font-mono">#{o.id}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold">
                          {o.customer_name}
                          {o.customer_notes && (
                            <span className="ml-2 cursor-help text-orange-500" title={o.customer_notes}>
                              💬
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{o.customer_email}</p>
                        {o.customer_notes && (
                          <p className="text-xs text-orange-600 mt-1 max-w-[200px] truncate" title={o.customer_notes}>
                            Obs: {o.customer_notes}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs">{o.customer_city || '-'}</td>
                      <td className="px-3 py-3 font-bold">
                        R$ {Number(o.total_amount).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={o.status}
                          onChange={(e) => atualizarStatus(o.id, e.target.value)}
                          className={`text-xs font-bold rounded px-2 py-1 border-0 ${
                            o.status === 'paid' ? 'bg-green-100 text-green-800' :
                            o.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            o.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                            o.status === 'canceled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <option value="pending">pending</option>
                          <option value="paid">paid</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="canceled">canceled</option>
                        </select>
                      </td>
                      <td className="px-3 py-3 text-xs font-mono">{o.tracking_code || '-'}</td>
                      <td className="px-3 py-3 text-xs">
                        {new Date(o.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
