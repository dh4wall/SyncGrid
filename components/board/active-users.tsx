'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users } from 'lucide-react';

interface UserPresence {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  online_at: string;
}

interface ActiveUsersProps {
  roomId: string;
  roomType: 'board' | 'page';
}

export function ActiveUsers({ roomId, roomType }: ActiveUsersProps) {
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser(user);
        // Get user profile
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              trackPresence(supabase, user.id, profile.full_name || user.email || 'Anonymous');
            }
          });
      }
    });

    const channel = supabase.channel(`presence-${roomType}-${roomId}`, {
      config: {
        presence: {
          key: roomId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          presences.forEach((presence) => {
            users.push(presence as UserPresence);
          });
        });
        
        setActiveUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track initial presence
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single();

            await channel.track({
              user_id: user.id,
              user_name: profile?.full_name || user.email || 'Anonymous',
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, roomType]);

  const trackPresence = async (supabase: any, userId: string, userName: string) => {
    // Presence is tracked in the useEffect subscribe callback
  };

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm">
      <Users className="w-4 h-4 text-gray-600" />
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 5).map((user, index) => (
          <div
            key={user.user_id}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
            title={user.user_name}
          >
            {user.user_name?.charAt(0).toUpperCase()}
          </div>
        ))}
        {activeUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
            +{activeUsers.length - 5}
          </div>
        )}
      </div>
      <span className="text-sm text-gray-600">
        {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
      </span>
    </div>
  );
}
