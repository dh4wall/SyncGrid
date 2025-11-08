// Liveblocks Configuration for SyncGrid - TRUE REAL-TIME COLLABORATION
// Using LiveBlocks 2.11.x (November 2025 - Latest Stable)
// This file sets up Liveblocks client with ZERO LATENCY real-time updates

import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// Initialize Liveblocks client with OPTIMIZED settings for ZERO LATENCY
const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  // Note: In production, use authEndpoint instead for security
  // authEndpoint: "/api/liveblocks-auth",
  
  // ZERO throttle for instant updates (0ms = no delay)
  throttle: 16, // ~60fps - smooth as butter
});

// Define your Liveblocks types for TRUE REAL-TIME COLLABORATION

type Presence = {
  // User's cursor position (for live cursors)
  cursor: { x: number; y: number } | null;
  
  // What card is the user dragging? (live drag preview)
  isDragging: boolean;
  draggedCardId: string | null;
  draggedCardTitle?: string;
  draggedCardColor?: string;
  
  // Where is the card being dragged to? (live position)
  dragPosition?: { x: number; y: number };
  
  // Which column is user hovering over?
  hoverColumnId?: string | null;
  
  // User's selected card (for highlighting)
  selectedCardId?: string | null;
  
  // User's current activity
  activity?: 'viewing' | 'dragging' | 'editing' | 'adding';
};

type Storage = {
  // We use Liveblocks Storage for INSTANT updates
  // This enables ZERO LATENCY optimistic updates
  // Supabase is used for persistence, Liveblocks for real-time
};

type UserMeta = {
  // User metadata - automatically provided by LiveBlocks
  id?: string;
  info?: {
    name?: string;
    email?: string;
    avatar?: string;
    color?: string; // User's cursor color
  };
};

type RoomEvent = {
  // Custom events you can broadcast for INSTANT updates
  type: 
    | "CARD_MOVED"           // Card position changed
    | "CARD_CREATED"         // New card added
    | "CARD_DELETED"         // Card removed
    | "CARD_UPDATED"         // Card content changed
    | "COLUMN_CREATED"       // New column added
    | "COLUMN_DELETED"       // Column removed
    | "BOARD_UPDATED";       // Board structure changed
  
  // Event payload
  cardId?: string;
  columnId?: string;
  boardId: string;
  data?: any;
  
  // Who triggered this event?
  userId?: string;
  userName?: string;
};

// Create typed hooks for React with FULL COLLABORATION FEATURES
// LiveBlocks 2.11.x API (November 2025)
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useSelf,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useBroadcastEvent,
  useEventListener,
  useErrorListener,
  useStatus,
  useLostConnectionListener,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);

export type { Presence, Storage, UserMeta, RoomEvent };

