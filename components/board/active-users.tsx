// filepath: /home/dh4wall/Documents/my_proj/froncort/syncgrid/components/board/active-users.tsx
'use client';

import { useOthers, useSelf } from '@/lib/liveblocks';
import { Users } from 'lucide-react';

interface ActiveUsersProps {
  roomId: string;
  roomType: 'board' | 'page';
}

export function ActiveUsers({ roomId, roomType }: ActiveUsersProps) {
  // Try to use Liveblocks hooks, but gracefully handle if not in RoomProvider
  let others: readonly any[] = [];
  let self: any = null;
  
  try {
    others = useOthers();
    self = useSelf();
  } catch (error) {
    // Not in RoomProvider context - that's OK, just don't show users
    return null;
  }

  const totalUsers = others.length + (self ? 1 : 0);

  if (totalUsers === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm">
      <Users className="w-4 h-4 text-green-600" />
      <div className="flex items-center gap-2">
        {/* Show user avatars */}
        <div className="flex -space-x-2">
          {self && (
            <div
              key="self"
              className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
              title={`${self.info?.name} (You)`}
            >
              {self.info?.name?.charAt(0).toUpperCase() || 'Y'}
            </div>
          )}
          {others.slice(0, 4).map((other: any) => (
            <div
              key={other.connectionId}
              className="w-8 h-8 rounded-full bg-linear-to-br from-purple-400 to-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
              title={other.info?.name || 'Anonymous'}
            >
              {other.info?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          ))}
          {others.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
              +{others.length - 4}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-700 font-medium">
          {totalUsers} {totalUsers === 1 ? 'person' : 'people'} online
        </span>
      </div>
    </div>
  );
}
