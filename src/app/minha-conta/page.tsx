'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function MinhaContaPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/conta');
      return;
    }

    if (user) {
      const fetchOrders = async () => {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_email', user.email)
          .order('created_at', { ascending: false });
        
        if (data) setOrders(data);
        setLoading(false);
      };
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmacao = window.confirm(
      'Tem certeza que deseja excluir sua conta?\n\nEsta ação é irreversível. Seus dados de perfil serão apagados (o histórico de pedidos será mantido por questões fiscais).'
    );
    
    if (!confirmacao) return;

    setDeletando(true);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) throw new Error('Erro ao excluir conta');

      await signOut();
      alert('Sua conta foi excluída com sucesso.');
      router.push('/');
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir a conta. Tente novamente.');
      setDeletando(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black">Minha Conta</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline font-semibold">Sair</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Meus Pedidos</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Você ainda não fez nenhum pedido.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-bold">Pedido #{order.id}</p>
                    <p className="text-sm text-gray-500">Data: {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                      order.status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'canceled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ÁREA DE PERIGO: EXCLUSÃO DE CONTA */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-red-800 mb-2">Excluir Conta</h2>
          <p className="text-sm text-red-600 mb-4">
            Ao excluir sua conta, você perderá o acesso ao histórico de compras e seus dados de perfil serão removidos permanentemente.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deletando}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition disabled:bg-gray-400"
          >
            {deletando ? 'Excluindo...' : 'Excluir minha conta'}
          </button>
        </div>

        <Link href="/" className="block text-center w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-orange-500 transition">
          Continuar Comprando
        </Link>
      </div>
    </main>
  );
}
