import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { data: invitation, error: lookupError } = await supabase
    .from('project_members')
    .select('id, project_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('invitation_status', 'pending')
    .single();

  if (lookupError || !invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('project_members')
    .update({ invitation_status: 'active', joined_at: new Date().toISOString() })
    .eq('id', invitation.id)
    .eq('user_id', user.id)
    .eq('invitation_status', 'pending');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/dashboard');
  revalidatePath(`/projects/${invitation.project_id}`);
  return NextResponse.json({ success: true, projectId: invitation.project_id });
}
