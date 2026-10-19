import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Usa a chave de admin para deletar
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 1. Deleta da tabela profiles (como não tem FK, fazemos manual)
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // 2. Deleta o usuário da autenticação do Supabase
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Erro ao excluir conta:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir conta' },
      { status: 500 }
    );
  }
}
