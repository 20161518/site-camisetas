'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export default function CheckoutPage() {
  const { items, total, count } = useCart();
  const { user } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [endereco, setEndereco] = useState<Endereco>({
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  });
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // Estados do Frete
  const [frete, setFrete] = useState(0);
  const [prazoFrete, setPrazoFrete] = useState('');

  // Estados do Cupom
  const [cupomInput, setCupomInput] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [cupomErro, setCupomErro] = useState('');
  const [buscandoCupom, setBuscandoCupom] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      supabase.from('profiles').select('full_name, phone, address, city, cep').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          if (data.full_name) setNome(data.full_name);
          if (data.phone) setTelefone(data.phone);
          if (data.cep) setEndereco(prev => ({ ...prev, cep: data.cep, rua: data.address || '', cidade: data.city || '' }));
        }
      });
    }
  }, [user]);

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    setBuscandoCep(true);
    
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      
      if (!data.erro) {
        setEndereco((prev) => ({
          ...prev, rua: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '',
        }));

        // CHAMA A API DE FRETE
        const resFrete = await fetch('/api/calculate-shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cep: cepLimpo }),
        });
        const dataFrete = await resFrete.json();
        
        if (resFrete.ok) {
          setFrete(dataFrete.frete);
          setPrazoFrete(dataFrete.prazo);
        }
      }
    } catch (e) { 
      console.error(e); 
    }
    setBuscandoCep(false);
  };

  const aplicarCupom = async () => {
    setCupomErro('');
    setDesconto(0);
    setCupomAplicado('');
    if (!cupomInput.trim()) return;
    setBuscandoCupom(true);
    try {
      const { data, error } = await supabase.from('coupons').select('*').eq('code', cupomInput.trim().toUpperCase()).eq('active', true).single();
      if (error || !data) throw new Error('Cupom invalido ou expirado');
      if (data.min_purchase && total < Number(data.min_purchase)) throw new Error(`Este cupom exige compra minima de R$ ${Number(data.min_purchase).toFixed(2).replace('.', ',')}`);
      
      let valorDesconto = data.discount_percent ? total * (data.discount_percent / 100) : Number(data.discount_fixed);
      if (valorDesconto > total) valorDesconto = total;
      
      setDesconto(valorDesconto);
      setCupomAplicado(data.code);
      setCupomInput('');
    } catch (err: any) {
      setCupomErro(err.message);
    } finally {
      setBuscandoCupom(false);
    }
  };

  const removerCupom = () => { setCupomAplicado(''); setDesconto(0); setCupomErro(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (!nome || !email || !endereco.cep || !endereco.numero) { setErro('Preencha todos os campos obrigatórios'); return; }
    
    setEnviando(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items, 
          customer: { nome, email, telefone, ...endereco, observacoes }, 
          total, 
          shipping: frete, // Envia o frete
          discount: desconto, 
          couponCode: cupomAplicado
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar pagamento');
      if (data.init_point) window.location.href = data.init_point;
      else throw new Error('Link de pagamento nao recebido');
    } catch (e: any) {
      setErro(e.message || 'Erro ao processar pagamento. Tente novamente.');
      setEnviando(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-3xl font-bold">Carrinho vazio</h1>
        <Link href="/" className="mt-4 bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-500 transition">
          Voltar para a loja
        </Link>
      </main>
    );
  }

  const totalFinal = total + frete - desconto;

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/carrinho" className="text-sm text-gray-500 hover:text-black">&larr; Voltar ao carrinho</Link>
        <h1 className="text-3xl font-black mt-4 mb-8">Finalizar Compra</h1>

        {erro && <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{erro}</div>}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {/* DADOS PESSOAIS */}
            <div className="border rounded-lg p-6">
              <h2 className="font-bold text-lg mb-4">Dados pessoais</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nome completo *</label>
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">E-mail *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!user} className={`w-full border-2 border-gray-300 rounded-lg px-4 py-2 outline-none ${user ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-black'}`} required />
                    {user && <p className="text-xs text-green-600 mt-1">Logado como {user.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Telefone / WhatsApp</label>
                    <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Observações (Opcional)</label>
                  <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Ex: Para o Kit, quais tamanhos e cores você deseja?" rows={3} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

            {/* ENDEREÇO */}
            <div className="border rounded-lg p-6">
              <h2 className="font-bold text-lg mb-4">Endereco de entrega</h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">CEP *</label>
                    <input type="text" value={endereco.cep} onChange={(e) => { const v = e.target.value; setEndereco((prev) => ({ ...prev, cep: v })); if (v.replace(/\D/g, '').length === 8) buscarCep(v); }} placeholder="00000-000" className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" required />
                    {buscandoCep && <p className="text-xs text-gray-500 mt-1">Buscando frete...</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Numero *</label>
                    <input type="text" value={endereco.numero} onChange={(e) => setEndereco((prev) => ({ ...prev, numero: e.target.value }))} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Rua</label>
                  <input type="text" value={endereco.rua} onChange={(e) => setEndereco((prev) => ({ ...prev, rua: e.target.value }))} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Complemento</label>
                    <input type="text" value={endereco.complemento} onChange={(e) => setEndereco((prev) => ({ ...prev, complemento: e.target.value }))} placeholder="Apto, bloco, etc" className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Bairro</label>
                    <input type="text" value={endereco.bairro} onChange={(e) => setEndereco((prev) => ({ ...prev, bairro: e.target.value }))} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Cidade</label>
                    <input type="text" value={endereco.cidade} onChange={(e) => setEndereco((prev) => ({ ...prev, cidade: e.target.value }))} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Estado</label>
                    <input type="text" value={endereco.estado} onChange={(e) => setEndereco((prev) => ({ ...prev, estado: e.target.value }))} maxLength={2} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none uppercase" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RESUMO DO PEDIDO */}
          <div>
            <div className="border rounded-lg p-6 sticky top-6">
              <h2 className="font-bold text-lg mb-4">Resumo do pedido</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 text-sm">
                    <img src={item.image_url} alt={item.name} className="w-12 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.color} · {item.size} · {item.quantity}x</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-b py-4 my-4">
                <p className="text-sm font-semibold mb-2">Cupom de Desconto</p>
                {cupomAplicado ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-green-700 font-bold">{cupomAplicado} (-R$ {desconto.toFixed(2).replace('.', ',')})</span>
                    <button type="button" onClick={removerCupom} className="text-xs text-red-500 hover:underline">Remover</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={cupomInput} onChange={(e) => setCupomInput(e.target.value)} placeholder="Digite o cupom" className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-black outline-none uppercase" />
                    <button type="button" onClick={aplicarCupom} disabled={buscandoCupom} className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-black transition disabled:bg-gray-400">{buscandoCupom ? '...' : 'Aplicar'}</button>
                  </div>
                )}
                {cupomErro && <p className="text-xs text-red-500 mt-2">{cupomErro}</p>}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal ({count} itens)</span><span>R$ {total.toFixed(2).replace('.', ',')}</span></div>
                {desconto > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>- R$ {desconto.toFixed(2).replace('.', ',')}</span></div>}
                <div className="flex justify-between text-gray-500">
                  <span>Frete</span>
                  <span>{frete > 0 ? `R$ ${frete.toFixed(2).replace('.', ',')}` : 'Digite o CEP'}</span>
                </div>
                {prazoFrete && <p className="text-xs text-gray-400 text-right">{prazoFrete}</p>}
              </div>

              <div className="border-t mt-4 pt-4 flex justify-between items-center font-bold text-lg">
                <span>Total</span><span>R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
              </div>

              <button type="submit" disabled={enviando} className="w-full mt-6 bg-black text-white py-4 rounded-lg font-bold hover:bg-orange-500 transition disabled:bg-gray-400">{enviando ? 'Redirecionando...' : 'Ir para o pagamento'}</button>
              <p className="text-xs text-gray-500 mt-3 text-center">Pagamento seguro via Mercado Pago</p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
