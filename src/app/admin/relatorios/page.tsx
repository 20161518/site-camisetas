'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'univer2112@gmail.com';

interface Order {
  id: number;
  customer_city: string;
  total_amount: number;
  status: string;
  items: any[];
  created_at: string;
}

export default function AdminRelatoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtroDias, setFiltroDias] = useState(30);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/admin/login');
        return;
      }

      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - filtroDias);

      const { data } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['paid', 'shipped', 'delivered'])
        .gte('created_at', dataLimite.toISOString())
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };
    checkAuth();
  }, [router, filtroDias]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando relatórios...</div>;

  // Cálculos
  const faturamentoTotal = orders.reduce((acc, o) => acc + Number(o.total_amount), 0);
  const ticketMedio = orders.length > 0 ? faturamentoTotal / orders.length : 0;

  // Vendas por Cidade
  const vendasPorCidade = orders.reduce((acc, order) => {
    const cidade = order.customer_city || 'Não informada';
    if (!acc[cidade]) acc[cidade] = 0;
    acc[cidade] += Number(order.total_amount);
    return acc;
  }, {} as Record<string, number>);

  const cidadesOrdenadas = Object.entries(vendasPorCidade).sort((a, b) => b[1] - a[1]);
  const maxVendaCidade = Math.max(...Object.values(vendasPorCidade), 1);

  // Top Produtos
  const contagemProdutos = orders.reduce((acc, order) => {
    if (Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const nome = item.name;
        acc[nome] = (acc[nome] || 0) + item.quantity;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const produtosOrdenados = Object.entries(contagemProdutos).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-black text-white py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/admin/painel" className="font-black text-xl">ONSTAGE Admin</Link>
          <div className="flex gap-4">
            <Link href="/admin/painel" className="text-sm text-gray-300 hover:text-white">Pedidos</Link>
            <Link href="/admin/produtos" className="text-sm text-gray-300 hover:text-white">Produtos</Link>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="text-sm text-red-400 hover:text-red-300 font-bold">Sair</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black">Relatórios de Vendas</h1>
          <select value={filtroDias} onChange={(e) => setFiltroDias(Number(e.target.value))} className="border-2 border-gray-300 rounded-lg px-4 py-2 font-semibold focus:border-black outline-none">
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={365}>Último ano</option>
          </select>
        </div>

        {/* CARDS DE RESUMO */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500 mb-1">Faturamento Total</p>
            <p className="text-3xl font-black text-green-600">R$ {faturamentoTotal.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500 mb-1">Ticket Médio</p>
            <p className="text-3xl font-black">R$ {ticketMedio.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500 mb-1">Total de Vendas</p>
            <p className="text-3xl font-black">{orders.length} pedidos</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* GRÁFICO DE CIDADES */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold mb-6">Vendas por Cidade</h2>
            {cidadesOrdenadas.length === 0 ? (
              <p className="text-gray-500">Nenhuma venda no período.</p>
            ) : (
              <div className="space-y-4">
                {cidadesOrdenadas.slice(0, 8).map(([cidade, valor]) => (
                  <div key={cidade}>
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span>{cidade}</span>
                      <span>R$ {valor.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="bg-orange-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${(valor / maxVendaCidade) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOP PRODUTOS */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold mb-6">Top 5 Produtos Mais Vendidos</h2>
            {produtosOrdenados.length === 0 ? (
              <p className="text-gray-500">Nenhuma venda no período.</p>
            ) : (
              <div className="space-y-4">
                {produtosOrdenados.map(([nome, qtd], index) => (
                  <div key={nome} className="flex items-center gap-4 border-b pb-3 last:border-0">
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{nome}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black">{qtd}</span>
                      <span className="text-xs text-gray-500 ml-1">un.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
