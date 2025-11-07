'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PageUpdate {
  id: string;
  content: any;
  updated_at: string;
}

interface UserPresence {
  user_id: string;
  user_name: string;
  cursor_position?: number;
  last_seen: number;
}

export function useRealtimePage(pageId: string) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [presence, setPresence] = useState<Record<string, UserPresence>>({});
  const supabase = createClient();

  useEffect(() => {
    if (!pageId) return;

    console.log('Setting up realtime subscription for page:', pageId);

    const realtimeChannel = supabase
      .channel(`page-${pageId}`, {
        config: {
          presence: {
            key: pageId,
          },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pages',
          filter: `id=eq.${pageId}`,
        },
        (payload: any) => {
          console.log('Page content changed:', payload);
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = realtimeChannel.presenceState();
        console.log('Presence sync:', state);
        setPresence(state as any);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status: string) => {
        console.log('Page realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single();

            await realtimeChannel.track({
              user_id: user.id,
              user_name: profile?.full_name || 'Anonymous',
              last_seen: Date.now(),
            });
          }
        }
      });

    setChannel(realtimeChannel);

    return () => {
      console.log('Cleaning up page realtime subscription');
      realtimeChannel.unsubscribe();
    };
  }, [pageId]);

  const updatePresence = async (data: Partial<UserPresence>) => {
    if (channel) {
      await channel.track({
        ...data,
        last_seen: Date.now(),
      });
    }
  };

  return { channel, presence, updatePresence };
}
