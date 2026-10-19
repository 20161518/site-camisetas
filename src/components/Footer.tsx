import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-12 mt-20 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-black text-white mb-4">ONSTAGE</h3>
            <p className="text-sm mb-4 max-w-sm">
              A Onstage é especializada em camisetas masculinas com design exclusivo. 
              Encontre seu estilo e destaque-se.
            </p>
            <p className="text-sm">CNPJ: 00.000.000/0001-00</p>
            <p className="text-sm">Taio - SC</p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Institucional</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-orange-500 transition">Sobre Nós</Link></li>
              <li><Link href="/" className="hover:text-orange-500 transition">Política de Trocas</Link></li>
              <li><Link href="/" className="hover:text-orange-500 transition">Política de Privacidade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Atendimento</h4>
            <ul className="space-y-2 text-sm">
              <li>WhatsApp: (49) 99917-8914</li>
              <li>E-mail: contato@onstage.com.br</li>
              <li>Seg a Sex - 08h às 18h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} Onstage Camisetas. Todos os direitos reservados.</p>
          <div className="flex gap-2">
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">Pix</span>
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">Visa</span>
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">Mastercard</span>
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">Boleto</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
