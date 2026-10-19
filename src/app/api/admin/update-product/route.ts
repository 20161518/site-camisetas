import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...dadosAtualizados } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { error } = await supabaseAdmin
      .from('products')
      .update(dadosAtualizados)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
