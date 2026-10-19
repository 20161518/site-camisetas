import Link from 'next/link';

export default function FalhaPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-8 rounded-2xl mb-6">
          <div className="text-6xl mb-4">✕</div>
          <h1 className="text-3xl font-black mb-2">Pagamento Não Aprovado</h1>
          <p className="text-lg">Houve um problema com seu pagamento.</p>
        </div>

        <p className="text-gray-600 mb-8">
          Por favor, tente novamente com outro método de pagamento ou entre em
          contato conosco caso o problema persista.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/checkout"
            className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-500 transition"
          >
            Tentar Novamente
          </Link>
          <Link
            href="/"
            className="border-2 border-black text-black px-8 py-3 rounded-lg font-bold hover:bg-black hover:text-white transition"
          >
            Voltar à Loja
          </Link>
        </div>
      </div>
    </main>
  );
}
