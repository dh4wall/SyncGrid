'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MousePointer2 } from 'lucide-react';

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  userColor: string;
}

interface CursorPresenceProps {
  roomId: string;
  roomType: 'editor' | 'board';
  currentUser: {
    id: string;
    name: string;
    color: string;
  };
}

/**
 * Live Cursor Presence - Shows real-time cursor positions
 * Uses Supabase Broadcast for INSTANT updates (no DB lag)
 */
export function CursorPresence({ roomId, roomType, currentUser }: CursorPresenceProps) {
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Create presence channel
    const presenceChannel = supabase.channel(`presence-${roomType}-${roomId}`, {
      config: { 
        broadcast: { self: false },
        presence: { key: currentUser.id }
      }
    });

    // Track other users' cursors
    presenceChannel
      .on('broadcast', { event: 'cursor-move' }, (payload: any) => {
        const { userId, userName, userColor, x, y } = payload.payload;
        
        // Ignore own cursor (extra safety check)
        if (userId === currentUser.id) return;
        
        setCursors(prev => {
          const newCursors = new Map(prev);
          newCursors.set(userId, { userId, userName, userColor, x, y });
          return newCursors;
        });
      })
      .on('broadcast', { event: 'cursor-leave' }, (payload: any) => {
        const { userId } = payload.payload;
        
        // Ignore own cursor
        if (userId === currentUser.id) return;
        
        setCursors(prev => {
          const newCursors = new Map(prev);
          newCursors.delete(userId);
          return newCursors;
        });
      })
      .subscribe();

    setChannel(presenceChannel);

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      if (!presenceChannel) return;
      
      // Throttle updates to ~60fps
      presenceChannel.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: {
          userId: currentUser.id,
          userName: currentUser.name,
          userColor: currentUser.color,
          x: e.clientX,
          y: e.clientY
        }
      });
    };

    // Throttle mouse move events
    let rafId: number;
    const throttledMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => handleMouseMove(e));
    };

    window.addEventListener('mousemove', throttledMouseMove);

    // Broadcast when user leaves the page
    const handleBeforeUnload = () => {
      presenceChannel.send({
        type: 'broadcast',
        event: 'cursor-leave',
        payload: { userId: currentUser.id }
      });
    };

    // Handle page visibility (tab switch, minimize)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        presenceChannel.send({
          type: 'broadcast',
          event: 'cursor-leave',
          payload: { userId: currentUser.id }
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (channel) {
        presenceChannel.send({
          type: 'broadcast',
          event: 'cursor-leave',
          payload: { userId: currentUser.id }
        });
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [roomId, roomType, currentUser.id]);

  return (
    <>
      {Array.from(cursors.values())
        .filter(cursor => cursor.userId !== currentUser.id) // Extra safety: never show own cursor
        .map((cursor) => (
        <div
          key={cursor.userId}
          className="fixed pointer-events-none z-50 transition-transform duration-75"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)',
          }}
        >
          <MousePointer2
            className="w-5 h-5"
            style={{ color: cursor.userColor }}
            fill={cursor.userColor}
          />
          <div
            className="absolute top-5 left-2 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
            style={{ backgroundColor: cursor.userColor }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
    </>
  );
}
