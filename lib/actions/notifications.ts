'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Create a notification for a user mention (@username)
 */
export async function createMentionNotification(params: {
  mentionedUserId: string;
  mentionedByUserId: string;
  mentionedByName: string;
  projectId: string;
  pageId?: string;
  cardId?: string;
  context: string; // Text snippet where mentioned
}) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.mentionedUserId,
      type: 'mention',
      title: `${params.mentionedByName} mentioned you`,
      message: `"${params.context.substring(0, 100)}${params.context.length > 100 ? '...' : ''}"`,
      data: {
        mentioned_by: params.mentionedByName,
        context: params.context,
        page_id: params.pageId,
        card_id: params.cardId
      },
      link: params.pageId 
        ? `/projects/${params.projectId}/editor?page=${params.pageId}`
        : `/projects/${params.projectId}/board`,
      project_id: params.projectId,
      triggered_by: params.mentionedByUserId
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating mention notification:', error);
    return { error: error.message };
  }

  return { success: true, id: data.id };
}

/**
 * Create a notification for a major change
 */
export async function createMajorChangeNotification(params: {
  userId: string;
  changeByUserId: string;
  changeByName: string;
  projectId: string;
  changeType: string;
  changeDescription: string;
}) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: 'major_change',
      title: `Major change: ${params.changeType}`,
      message: `${params.changeByName} ${params.changeDescription}`,
      data: {
        change_type: params.changeType,
        changed_by: params.changeByName
      },
      link: `/projects/${params.projectId}`,
      project_id: params.projectId,
      triggered_by: params.changeByUserId
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating major change notification:', error);
    return { error: error.message };
  }

  return { success: true, id: data.id };
}

/**
 * Create a notification for card assignment
 */
export async function createCardAssignmentNotification(params: {
  assignedUserId: string;
  assignedByUserId: string;
  assignedByName: string;
  projectId: string;
  cardId: string;
  cardTitle: string;
}) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.assignedUserId,
      type: 'card_assigned',
      title: 'Card assigned to you',
      message: `${params.assignedByName} assigned "${params.cardTitle}" to you`,
      data: {
        card_title: params.cardTitle,
        assigned_by: params.assignedByName
      },
      link: `/projects/${params.projectId}/board`,
      project_id: params.projectId,
      triggered_by: params.assignedByUserId
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating card assignment notification:', error);
    return { error: error.message };
  }

  return { success: true, id: data.id };
}

/**
 * Notify all project members of a major change
 */
export async function notifyProjectMembers(params: {
  projectId: string;
  changeByUserId: string;
  changeByName: string;
  changeType: string;
  changeDescription: string;
  excludeUserIds?: string[]; // Don't notify these users
}) {
  const supabase = await createServerSupabaseClient();

  // Get all project members
  const { data: members, error: membersError } = await supabase
    .from('project_members')
    .select('user_id')
    .eq('project_id', params.projectId);

  if (membersError || !members) {
    console.error('Error fetching project members:', membersError);
    return { error: membersError?.message };
  }

  // Filter out excluded users and the user who made the change
  const userIdsToNotify = members
    .map((m: { user_id: string }) => m.user_id)
    .filter((uid: string) => uid !== params.changeByUserId && !params.excludeUserIds?.includes(uid));

  // Create notifications for all members
  const notifications = userIdsToNotify.map((userId: string) => ({
    user_id: userId,
    type: 'major_change',
    title: `Major change: ${params.changeType}`,
    message: `${params.changeByName} ${params.changeDescription}`,
    data: {
      change_type: params.changeType,
      changed_by: params.changeByName
    },
    link: `/projects/${params.projectId}`,
    project_id: params.projectId,
    triggered_by: params.changeByUserId
  }));

  if (notifications.length === 0) {
    return { success: true, count: 0 };
  }

  const { error: insertError } = await supabase
    .from('notifications')
    .insert(notifications);

  if (insertError) {
    console.error('Error creating notifications:', insertError);
    return { error: insertError.message };
  }

  return { success: true, count: notifications.length };
}
