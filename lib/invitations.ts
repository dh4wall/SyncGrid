import { createServerSupabaseClient } from '@/lib/supabase/server';

export type InvitationRole = 'admin' | 'editor' | 'viewer';

export async function getPlatformUsers() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized', status: 401 as const };

  const { data: users, error } = await supabase
    .rpc('get_platform_users', { p_current_user_id: user.id });

  if (error) return { error: error.message, status: 500 as const };
  return { users: users || [] };
}

export async function getPendingInvitations() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized', status: 401 as const };

  const { data: invitations, error } = await supabase
    .from('project_members')
    .select('id, project_id, role, invited_at, invited_by, projects(id, name, icon)')
    .eq('user_id', user.id)
    .eq('invitation_status', 'pending')
    .order('invited_at', { ascending: false });

  if (error) return { error: error.message, status: 500 as const };

  const result = await Promise.all((invitations || []).map(async (invitation) => {
    const { data: inviter } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', invitation.invited_by)
      .maybeSingle();

    return { ...invitation, inviter };
  }));

  return { invitations: result };
}

export async function createInvitation(data: {
  projectId: string;
  userId: string;
  role: InvitationRole;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized', status: 401 as const };
  }

  if (!data.userId || !data.projectId) {
    return { error: 'Project and user are required', status: 400 as const };
  }

  const { data: existingMember, error: memberLookupError } = await supabase
    .from('project_members')
    .select('id, invitation_status')
    .eq('project_id', data.projectId)
    .eq('user_id', data.userId)
    .maybeSingle();

  if (memberLookupError) {
    return { error: memberLookupError.message, status: 500 as const };
  }

  if (existingMember) {
    return {
      error: existingMember.invitation_status === 'active'
        ? 'User is already a member'
        : 'User already has a pending invitation',
      status: 409 as const,
    };
  }

  const { data: invitation, error: insertError } = await supabase
    .from('project_members')
    .insert({
      project_id: data.projectId,
      user_id: data.userId,
      invited_email: null,
      role: data.role,
      invited_by: user.id,
      invitation_status: 'pending',
      invitation_token: crypto.randomUUID(),
    })
    .select('invitation_token')
    .single();

  if (insertError || !invitation?.invitation_token) {
    return {
      error: insertError?.message || 'Invitation was not created',
      status: 500 as const,
    };
  }

  return { invitationToken: invitation.invitation_token };
}
