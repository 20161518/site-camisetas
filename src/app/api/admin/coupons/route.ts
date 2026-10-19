import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const { code, discount_percent, discount_fixed, min_purchase } = await request.json();

    const { error } = await supabaseAdmin.from('coupons').insert({
      code: code.toUpperCase(),
      discount_percent: discount_percent || null,
      discount_fixed: discount_fixed || null,
      min_purchase: min_purchase || 0,
      active: true
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const { error } = await supabaseAdmin.from('coupons').delete().eq('id', id);
    if (error) throw error;
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
