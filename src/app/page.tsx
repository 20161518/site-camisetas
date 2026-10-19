import ProductGrid from '@/components/ProductGrid';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="bg-black text-white py-16 text-center relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-2">
            ONSTAGE
          </h1>
          <p className="text-xl text-orange-500 font-bold tracking-widest mb-6">
            FIND YOUR STYLE
          </p>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Liquidação de camisetas masculinas exclusivas. Estoque limitado e peças únicas.
          </p>
          
          {/* BOTÃO DO KIT EM DESTAQUE */}
          <Link 
            href="/kits" 
            className="inline-block bg-orange-500 text-black px-8 py-4 rounded-full font-black text-lg hover:bg-white transition transform hover:scale-105 shadow-[0_0_30px_rgba(249,115,22,0.4)]"
          >
            🔥 MONTE SEU KIT COM DESCONTO
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-12">
        <ProductGrid />
      </section>
    </main>
  );
}
