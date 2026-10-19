import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { cep } = await request.json();
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
    }

    // Busca o estado (UF) usando o ViaCEP
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await res.json();

    if (data.erro) {
      return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 });
    }

    const uf = data.uf;
    let frete = 0;
    let prazo = '';

    // TABELA DE FRETE POR REGIÃO (Baseado em Taio - SC)
    switch (uf) {
      case 'SC': // Sul
        frete = 19.90;
        prazo = '2 a 4 dias úteis';
        break;
      case 'PR':
      case 'RS':
        frete = 24.90;
        prazo = '3 a 6 dias úteis';
        break;
      case 'SP': // Sudeste
      case 'RJ':
      case 'MG':
      case 'ES':
        frete = 29.90;
        prazo = '4 a 8 dias úteis';
        break;
      case 'DF': // Centro-Oeste
      case 'GO':
      case 'MT':
      case 'MS':
        frete = 34.90;
        prazo = '5 a 9 dias úteis';
        break;
      case 'BA': // Nordeste
      case 'SE':
      case 'AL':
      case 'PE':
      case 'PB':
      case 'RN':
      case 'CE':
      case 'PI':
      case 'MA':
        frete = 44.90;
        prazo = '7 a 12 dias úteis';
        break;
      case 'AM': // Norte
      case 'RR':
      case 'AP':
      case 'PA':
      case 'TO':
      case 'RO':
      case 'AC':
        frete = 54.90;
        prazo = '8 a 14 dias úteis';
        break;
      default:
        frete = 59.90;
        prazo = '10 a 15 dias úteis';
    }

    return NextResponse.json({ uf, frete, prazo });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao calcular frete' }, { status: 500 });
  }
}
