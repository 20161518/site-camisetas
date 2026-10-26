import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

async function enviarEmail(destinatario: string, nome: string, assunto: string, html: string) {
  if (!process.env.BREVO_API_KEY) return;
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
      body: JSON.stringify({ sender: { name: 'LOJA Camisetas', email: 'univer2112@gmail.com' }, to: [{ email: destinatario, name: nome }], subject: assunto, htmlContent: html })
    });
  } catch (error) { console.error('Erro Brevo:', error); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.type !== 'payment' || !body.data?.id) return NextResponse.json({ ok: true });

    const paymentIdRecebido = String(body.data.id);
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    let nossoStatus = 'pending';
    let searchId = paymentIdRecebido;

    // BYPASS DE TESTE: Se o ID começa com "teste-", forçamos aprovação
    if (paymentIdRecebido.startsWith('teste-')) {
      console.log('Bypass de teste ativado para:', paymentIdRecebido);
      nossoStatus = 'paid';
    } else {
      // Fluxo real do Mercado Pago
      const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
      const payment = new Payment(mpClient);
      const paymentData = await payment.get({ id: body.data.id });
      searchId = String((paymentData as any).preference_id || paymentData.id);
      
      if (paymentData.status === 'approved') nossoStatus = 'paid';
      else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') nossoStatus = 'canceled';
    }

    const { data: pedido } = await supabaseAdmin.from('orders').select('*').eq('payment_id', searchId).single();
    if (!pedido || pedido.status === nossoStatus) return NextResponse.json({ ok: true });

    await supabaseAdmin.from('orders').update({ status: nossoStatus, updated_at: new Date().toISOString() }).eq('id', pedido.id);

    if (nossoStatus === 'paid') {
      for (const item of pedido.items) {
        const { data: product } = await supabaseAdmin.from('products').select('id, sizes_stock').eq('id', item.id).single();
        if (product && product.sizes_stock) {
          const newStock = { ...product.sizes_stock };
          const size = item.size;
          const qty = item.quantity;
          if (newStock[size] !== undefined) {
            newStock[size] = Math.max(0, newStock[size] - qty);
            await supabaseAdmin.from('products').update({ sizes_stock: newStock }).eq('id', product.id);
          }
        }
      }

      const htmlCliente = `<h2>Olá, ${pedido.customer_name}!</h2><p>Seu pagamento foi aprovado e seu pedido <strong>#${pedido.id}</strong> já está sendo preparado.</p>`;
      await enviarEmail(pedido.customer_email, pedido.customer_name, `Pedido #${pedido.id} Confirmado!`, htmlCliente);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: true, error: error.message });
  }
}
export async function GET() { return NextResponse.json({ ok: true }); }
