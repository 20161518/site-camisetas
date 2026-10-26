'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function KitsPage() {
  const router = useRouter();
  const { addItem } = useCart();

  const handleComprarKit = () => {
    // Adiciona o Kit (REF 4418) ao carrinho
    addItem({
      id: 999, // ID fixo para o kit
      ref: '4418',
      name: 'Kit 5 Camisetas Sortidas',
      price: 189.90,
      image_url: '/images/kit/4418.jpg',
      size: 'Sortidas',
      color: 'Sortidas',
      quantity: 1,
    });
    
    router.push('/carrinho');
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO SECTION */}
      <section className="relative py-20 px-4 text-center border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/images/kit/4418.jpg')] bg-cover bg-center blur-sm"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="bg-orange-500 text-black font-bold px-4 py-1 rounded-full text-sm uppercase tracking-wider mb-6 inline-block">
            Oferta Especial
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            MONTE SEU <span className="text-orange-500">KIT</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Leve 5 camisetas sortidas do nosso catálogo e pague apenas <strong>R$ 189,90</strong>. 
            Economize mais de R$ 30 e renove seu estilo.
          </p>
          <button 
            onClick={handleComprarKit}
            className="bg-white text-black text-xl font-black px-10 py-4 rounded-full hover:bg-orange-500 hover:text-white transition transform hover:scale-105 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
          >
            COMPRAR KIT AGORA
          </button>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12">Como funciona?</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="w-16 h-16 bg-orange-500 text-black rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">1</div>
            <h3 className="text-xl font-bold mb-3">Compre o Kit</h3>
            <p className="text-gray-400 text-sm">Adicione o Kit ao carrinho e finalize o pagamento com segurança.</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="w-16 h-16 bg-orange-500 text-black rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">2</div>
            <h3 className="text-xl font-bold mb-3">Escolha os Modelos</h3>
            <p className="text-gray-400 text-sm">Após a compra, nossa equipe entrará em contato via WhatsApp para você escolher as 5 estampas e tamanhos.</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="w-16 h-16 bg-orange-500 text-black rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">3</div>
            <h3 className="text-xl font-bold mb-3">Receba em Casa</h3>
            <p className="text-gray-400 text-sm">Enviamos o seu Kit completo com frete calculado na hora.</p>
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="text-center opacity-50">
            <p className="text-lg mb-2">Comprando separado</p>
            <p className="text-4xl font-bold line-through decoration-red-500 decoration-4">R$ 219,50</p>
            <p className="text-sm mt-2">Média de R$ 43,90 por camiseta</p>
          </div>
          
          <div className="text-6xl font-black text-orange-500 hidden md:block">=</div>
          
          <div className="text-center bg-orange-500 text-black p-8 rounded-3xl transform scale-110 shadow-2xl">
            <p className="text-lg font-bold mb-2">No Kit LOJA</p>
            <p className="text-5xl font-black">R$ 189,90</p>
            <p className="text-sm mt-2 font-bold">Apenas R$ 37,98 por camiseta!</p>
          </div>
        </div>
      </section>
    </main>
  );
}
