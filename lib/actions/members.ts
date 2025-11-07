'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function inviteMemberByEmail(data: {
  projectId: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Normalize email
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check if user exists - handle the case where user might not exist yet
  const { data: inviteeProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', normalizedEmail)
    .maybeSingle();

  // If user doesn't exist, we'll create a pending invitation anyway
  // When they sign up, they can claim the invitation
  let inviteeUserId = null;
  
  if (inviteeProfile) {
    inviteeUserId = inviteeProfile.id;
    
    // Check if already a member
    const { data: existingMember } = await supabase
      .from('project_members')
      .select('id, invitation_status')
      .eq('project_id', data.projectId)
      .eq('user_id', inviteeUserId)
      .maybeSingle();

    if (existingMember) {
      if (existingMember.invitation_status === 'active') {
        throw new Error('User is already a member');
      } else {
        throw new Error('User already has a pending invitation');
      }
    }
  } else {
    // Check for existing email-based invitation
    const { data: existingEmailInvite } = await supabase
      .from('project_members')
      .select('id, invitation_status')
      .eq('project_id', data.projectId)
      .eq('invited_email', normalizedEmail)
      .maybeSingle();

    if (existingEmailInvite) {
      throw new Error('An invitation has already been sent to this email');
    }
  }

  // Generate invitation token
  const invitationToken = crypto.randomUUID();

  // Create invitation
  const { data: invitation, error } = await supabase
    .from('project_members')
    .insert({
      project_id: data.projectId,
      user_id: inviteeUserId, // null if user doesn't exist yet
      invited_email: normalizedEmail,
      role: data.role,
      invited_by: user.id,
      invitation_status: 'pending',
      invitation_token: invitationToken
    })
    .select('invitation_token')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${data.projectId}/settings`);
  return { invitationToken: invitation.invitation_token };
}

export async function acceptInvitation(invitationToken: string) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  console.log('Accepting invitation for token:', invitationToken, 'user:', user.id);

  // Get user profile first
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    console.error('Profile error:', profileError);
    throw new Error('User profile not found');
  }

  console.log('User profile:', userProfile.email);

  // Find the invitation by token - try without status filter first for debugging
  const { data: invitations, error: findError } = await supabase
    .from('project_members')
    .select('id, user_id, invited_email, project_id, invitation_status, invitation_token')
    .eq('invitation_token', invitationToken);

  console.log('Found invitations:', invitations);
  console.log('Find error:', findError);

  if (findError) {
    throw new Error(`Database error: ${findError.message}`);
  }

  if (!invitations || invitations.length === 0) {
    throw new Error('Invitation not found');
  }

  const invitation = invitations.find(inv => inv.invitation_status === 'pending');
  
  if (!invitation) {
    throw new Error('Invitation has already been accepted or expired');
  }

  console.log('Processing invitation:', invitation);

  // Check if this invitation is for the current user
  const canAccept = 
    invitation.user_id === user.id || 
    invitation.invited_email === userProfile.email;

  if (!canAccept) {
    console.log('Cannot accept - user_id match:', invitation.user_id === user.id, 'email match:', invitation.invited_email === userProfile.email);
    throw new Error('This invitation is not for you');
  }

  // Accept the invitation
  const { error } = await supabase
    .from('project_members')
    .update({ 
      invitation_status: 'active',
      user_id: user.id,
      invited_email: null,
      joined_at: new Date().toISOString()
    })
    .eq('invitation_token', invitationToken)
    .eq('invitation_status', 'pending');

  if (error) {
    console.error('Update error:', error);
    throw new Error('Failed to accept invitation');
  }

  console.log('Invitation accepted successfully');

  revalidatePath('/dashboard');
  revalidatePath(`/projects/${invitation.project_id}`);
}

export async function getProjectMembers(projectId: string) {
  const supabase = await createServerSupabaseClient();

  // Get members with their profile data
  const { data: members, error } = await supabase
    .from('project_members')
    .select(`
      id,
      project_id,
      user_id,
      invited_email,
      role,
      invitation_status,
      joined_at,
      invited_at,
      invited_by,
      invitation_token
    `)
    .eq('project_id', projectId)
    .order('joined_at', { nullsFirst: false });

  if (error) {
    console.error('Get members error:', error);
    throw new Error(error.message);
  }

  if (!members) return [];

  // Manually fetch profile data for each member
  const membersWithProfiles = await Promise.all(
    members.map(async (member) => {
      let userProfile = null;
      let inviterProfile = null;

      console.log('Processing member:', {
        id: member.id,
        user_id: member.user_id,
        invited_email: member.invited_email,
        role: member.role,
        status: member.invitation_status
      });

      // Fetch user profile if user_id exists
      if (member.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', member.user_id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        } else if (profile) {
          userProfile = profile;
          console.log('User profile found:', profile.full_name, profile.email);
        } else {
          console.warn('No profile found for user_id:', member.user_id);
        }
      } else {
        console.log('No user_id, this is an email-only invitation:', member.invited_email);
      }

      // Fetch inviter profile if invited_by exists
      if (member.invited_by) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', member.invited_by)
          .maybeSingle();
        inviterProfile = profile;
      }

      const result = {
        ...member,
        profiles: userProfile,
        inviter: inviterProfile,
      };
      
      console.log('Member result:', {
        role: result.role,
        hasProfile: !!result.profiles,
        profileName: result.profiles?.full_name,
        invitedEmail: result.invited_email
      });

      return result;
    })
  );

  console.log('Final members count:', membersWithProfiles.length);
  return membersWithProfiles;
}

export async function updateMemberRole(data: {
  projectId: string;
  memberId: string;
  role: 'admin' | 'editor' | 'viewer';
}) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('project_members')
    .update({ role: data.role })
    .eq('id', data.memberId)
    .eq('project_id', data.projectId);

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${data.projectId}/settings`);
}

export async function removeMember(projectId: string, memberId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId)
    .eq('project_id', projectId);

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/settings`);
}
