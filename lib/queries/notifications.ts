import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/types/notifications';

/**
 * Get notifications for current user
 */
export async function getNotifications(limit = 20): Promise<Notification[]> {
  const supabase = createClient();
  
  // First, check if the table exists
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    // If table doesn't exist, return empty array (user needs to run migration)
    if (error.code === 'PGRST200' || error.message.includes('relation') || error.message.includes('does not exist')) {
      console.warn('⚠️ Notifications table not found. Please run: sql/database25_notifications_system.sql');
      return [];
    }
    console.error('Error fetching notifications:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('read', false);
  
  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
  
  return data?.length || 0;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);
  
  if (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('read', false);
  
  if (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  
  if (error) {
    console.error('Error deleting notification:', error);
  }
}

/**
 * Create a notification (typically called from server actions)
 */
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  link?: string;
  projectId?: string;
  triggeredBy?: string;
}): Promise<string | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || {},
      link: params.link,
      project_id: params.projectId,
      triggered_by: params.triggeredBy,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }
  
  return data?.id || null;
}
