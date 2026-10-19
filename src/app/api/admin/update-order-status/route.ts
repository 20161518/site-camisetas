import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { id, status, tracking_code } = await request.json();
    
    // 1. Atualiza o banco de dados
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { error: dbError } = await supabaseAdmin
      .from('orders')
      .update({ status, tracking_code, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (dbError) {
      console.error('Erro DB:', dbError);
      return NextResponse.json({ error: 'Erro ao atualizar no banco' }, { status: 500 });
    }

    // 2. Busca os dados do pedido para enviar o e-mail
    const { data: pedido } = await supabaseAdmin.from('orders').select('*').eq('id', id).single();

    // 3. Envia o e-mail se o status for "shipped"
    if (pedido && status === 'shipped' && process.env.BREVO_API_KEY) {
      const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          sender: { name: 'Onstage Camisetas', email: 'univer2112@gmail.com' },
          to: [{ email: pedido.customer_email, name: pedido.customer_name }],
          subject: `Seu pedido #${pedido.id} foi enviado!`,
          htmlContent: `
            <h2>Boas notícias, ${pedido.customer_name}!</h2>
            <p>Seu pedido <strong>#${pedido.id}</strong> acabou de ser enviado.</p>
            <p><strong>Código de rastreio:</strong> ${tracking_code || 'Em breve'}</p>
            <p>Você pode acompanhar a entrega no site dos Correios.</p>
          `
        })
      });

      if (!brevoResponse.ok) {
        const brevoError = await brevoResponse.text();
        console.error('Erro Brevo:', brevoError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Erro API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
