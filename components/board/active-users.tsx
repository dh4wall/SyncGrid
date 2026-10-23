'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users } from 'lucide-react';

interface ActiveUsersProps {
  roomId: string;
  roomType: 'board' | 'page';
}

interface OnlineUser {
  userId: string;
  name: string;
  color: string;
}

export function ActiveUsers({ roomId, roomType }: ActiveUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const fetchAndTrack = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const hash = user.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const myColor = colors[hash % colors.length];
      const myName = user.email?.split('@')[0] || 'Anonymous';

      const channel = supabase.channel(`active-users-${roomType}-${roomId}`, {
        config: { presence: { key: user.id } },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState<{ name: string; color: string }>();
          const users: OnlineUser[] = Object.entries(state).map(([userId, presences]) => ({
            userId,
            name: (presences[0] as any).name,
            color: (presences[0] as any).color,
          }));
          setOnlineUsers(users);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ name: myName, color: myColor });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    let cleanup: (() => void) | undefined;
    fetchAndTrack().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
  }, [roomId, roomType]);

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm">
      <Users className="w-4 h-4 text-green-600" />
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 5).map((u) => (
            <div
              key={u.userId}
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: u.color }}
              title={u.name}
            >
              {u.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-700 font-medium">
          {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} online
        </span>
      </div>
    </div>
  );
}
