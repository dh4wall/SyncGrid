'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/lib/queries/notifications';
import type { Notification } from '@/types/notifications';
import { useUser } from './use-user';

/**
 * Hook to manage notifications with real-time updates
 */
export function useNotifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const [notifs, count] = await Promise.all([
      getNotifications(50),
      getUnreadCount()
    ]);
    
    setNotifications(notifs);
    setUnreadCount(count);
    setLoading(false);
  }, [user]);

  // Mark as read
  const markRead = useCallback(async (notificationId: string) => {
    await markAsRead(notificationId);
    
    // Update local state optimistically
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    await markAllAsRead();
    
    // Update local state optimistically
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const supabase = createClient();
    
    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 New notification:', payload.new);
          
          // Add to beginning of list
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            const notif = payload.new as Notification;
            new Notification(notif.title, {
              body: notif.message,
              icon: '/notification-icon.png',
              tag: notif.id
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Notification updated:', payload.new);
          
          // Update in list
          setNotifications(prev => 
            prev.map(n => n.id === (payload.new as Notification).id ? payload.new as Notification : n)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Notification deleted:', payload.old);
          
          // Remove from list
          setNotifications(prev => 
            prev.filter(n => n.id !== (payload.old as Notification).id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadNotifications]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh: loadNotifications,
    requestNotificationPermission
  };
}
