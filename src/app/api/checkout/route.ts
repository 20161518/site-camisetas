import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, total, discount, couponCode, shipping } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    let siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    if (siteUrl.startsWith('http://localhost')) {
      siteUrl = 'https://site-camisetas.vercel.app';
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const preference = new Preference(client);
    
    const mpItems = items.map((item: any) => ({
      id: item.ref,
      title: `${item.name} - ${item.color} - ${item.size}`,
      description: `REF ${item.ref}`,
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: 'BRL',
    }));

    // Adiciona o Frete como um item no Mercado Pago (se existir)
    if (shipping && shipping > 0) {
      mpItems.push({
        id: 'frete',
        title: 'Taxa de Entrega',
        description: 'Frete via Correios/Transportadora',
        quantity: 1,
        unit_price: Number(shipping),
        currency_id: 'BRL',
      });
    }

    // Adiciona o Desconto como um item negativo (se existir)
    if (discount && discount > 0) {
      mpItems.push({
        id: 'desconto',
        title: `Desconto (${couponCode})`,
        description: 'Cupom de desconto aplicado',
        quantity: 1,
        unit_price: -Math.abs(Number(discount)),
        currency_id: 'BRL',
      });
    }

    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: customer.nome,
          email: customer.email,
        },
        back_urls: {
          success: `${siteUrl}/sucesso`,
          failure: `${siteUrl}/falha`,
          pending: `${siteUrl}/sucesso`,
        },
        auto_return: 'approved',
        statement_descriptor: 'ONSTAGE',
        external_reference: `pedido-${Date.now()}`,
      },
    });

    const valorFinal = Number(total) + Number(shipping || 0) - Number(discount || 0);

    const { error: dbError } = await supabase.from('orders').insert({
      customer_name: customer.nome,
      customer_email: customer.email,
      customer_phone: customer.telefone || null,
      customer_address: `${customer.rua}, ${customer.numero} ${customer.complemento || ''} - ${customer.bairro}`,
      customer_city: `${customer.cidade} - ${customer.estado}`,
      customer_cep: customer.cep,
      customer_notes: customer.observacoes || null,
      items: items,
      subtotal: total,
      shipping: shipping || 0,
      coupon_code: couponCode || null,
      discount: discount || 0,
      total_amount: valorFinal,
      status: 'pending',
      payment_id: result.id,
    });

    if (dbError) {
      console.error('Erro ao salvar pedido:', dbError);
    }

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
    });
  } catch (error: any) {
    console.error('Erro ao criar preferencia:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar preferencia de pagamento' },
      { status: 500 }
    );
  }
}
