'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Circle } from 'lucide-react';

interface EditingUser {
  userId: string;
  userName: string;
  userColor: string;
  targetId: string; // card ID, editor selection, etc.
  targetType: 'card' | 'editor' | 'field';
  timestamp: number;
}

interface EditingPresenceProps {
  roomId: string;
  roomType: 'editor' | 'board';
  currentUser: {
    id: string;
    name: string;
    color: string;
  };
}

/**
 * Editing Presence - Shows who's editing what in real-time
 * Displays avatars/indicators on actively edited items
 */
export function EditingPresence({ roomId, roomType, currentUser }: EditingPresenceProps) {
  const [editingUsers, setEditingUsers] = useState<Map<string, EditingUser>>(new Map());
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const presenceChannel = supabase.channel(`editing-${roomType}-${roomId}`, {
      config: { 
        broadcast: { self: false },
        presence: { key: currentUser.id }
      }
    });

    presenceChannel
      .on('broadcast', { event: 'editing-start' }, (payload: any) => {
        const { userId, userName, userColor, targetId, targetType } = payload.payload;
        setEditingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(`${userId}-${targetId}`, {
            userId,
            userName,
            userColor,
            targetId,
            targetType,
            timestamp: Date.now()
          });
          return newMap;
        });
      })
      .on('broadcast', { event: 'editing-stop' }, (payload: any) => {
        const { userId, targetId } = payload.payload;
        setEditingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(`${userId}-${targetId}`);
          return newMap;
        });
      })
      .subscribe();

    setChannel(presenceChannel);

    // Cleanup stale editing states (>5 seconds old)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setEditingUsers(prev => {
        const newMap = new Map(prev);
        for (const [key, user] of newMap.entries()) {
          if (now - user.timestamp > 5000) {
            newMap.delete(key);
          }
        }
        return newMap;
      });
    }, 2000);

    return () => {
      clearInterval(cleanupInterval);
      if (channel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [roomId, roomType, currentUser.id]);

  // Expose method to notify editing state
  useEffect(() => {
    if (channel) {
      (window as any).__notifyEditingStart = (targetId: string, targetType: string) => {
        channel.send({
          type: 'broadcast',
          event: 'editing-start',
          payload: {
            userId: currentUser.id,
            userName: currentUser.name,
            userColor: currentUser.color,
            targetId,
            targetType
          }
        });
      };

      (window as any).__notifyEditingStop = (targetId: string) => {
        channel.send({
          type: 'broadcast',
          event: 'editing-stop',
          payload: {
            userId: currentUser.id,
            targetId
          }
        });
      };
    }
  }, [channel, currentUser]);

  return null; // This component manages state, rendering is done by consumers
}

// Hook to get editing users for a specific target
export function useEditingUsers(targetId: string) {
  const [users, setUsers] = useState<EditingUser[]>([]);

  useEffect(() => {
    const updateUsers = () => {
      const editingMap = (window as any).__editingUsers as Map<string, EditingUser> | undefined;
      if (editingMap) {
        const targetUsers = Array.from(editingMap.values()).filter(
          user => user.targetId === targetId
        );
        setUsers(targetUsers);
      }
    };

    // Poll for updates (or use event listener)
    const interval = setInterval(updateUsers, 100);
    return () => clearInterval(interval);
  }, [targetId]);

  return users;
}

// Component to show editing indicator on a card/element
export function EditingIndicator({ targetId }: { targetId: string }) {
  const users = useEditingUsers(targetId);

  if (users.length === 0) return null;

  return (
    <div className="absolute -top-2 -right-2 flex gap-1 z-10">
      {users.map((user) => (
        <div
          key={user.userId}
          className="relative group"
          title={`${user.userName} is editing`}
        >
          <Circle
            className="w-4 h-4 animate-pulse"
            style={{ color: user.userColor }}
            fill={user.userColor}
          />
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {user.userName} editing
          </div>
        </div>
      ))}
    </div>
  );
}
