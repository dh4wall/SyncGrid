import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name.trim()
      : '';

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email || '',
        full_name: fullName || null,
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Profile ensure failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
