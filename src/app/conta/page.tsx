'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ContaPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/minha-conta');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          // Salva o nome no perfil
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: nome
          });
        }
        
        setSucesso('Conta criada com sucesso! Você será redirecionado...');
        setTimeout(() => router.push('/minha-conta'), 2000);
      }
    } catch (err: any) {
      setErro(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <Link href="/" className="text-sm text-gray-500 hover:text-black mb-6 block text-center">
          &larr; Voltar para a loja
        </Link>
        
        <h1 className="text-2xl font-black text-center mb-2">
          {isLogin ? 'Acesse sua conta' : 'Crie sua conta'}
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          {isLogin ? 'Bem-vindo de volta!' : 'Leva menos de 1 minuto.'}
        </p>

        {erro && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{erro}</div>}
        {sucesso && <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{sucesso}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold mb-1">Nome completo</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" required />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-1">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-orange-500 transition disabled:bg-gray-400">
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setErro(''); }} className="text-sm text-gray-600 hover:text-black font-semibold underline">
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    </main>
  );
}
