import Link from 'next/link';

export default function SucessoPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-green-100 border-2 border-green-400 text-green-700 px-6 py-8 rounded-2xl mb-6">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-black mb-2">Compra Aprovada!</h1>
          <p className="text-lg">Obrigado pela sua compra.</p>
        </div>

        <p className="text-gray-600 mb-8">
          Você receberá um e-mail com os detalhes do pedido em alguns minutos.
          Seu pedido será processado e enviado em até 24h úteis.
        </p>

        <Link
          href="/"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-500 transition"
        >
          Continuar Comprando
        </Link>
      </div>
    </main>
  );
}
