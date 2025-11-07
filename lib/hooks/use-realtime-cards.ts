'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Card {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export function useRealtimeCards(boardId: string, onUpdate: (cards: Card[]) => void) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!boardId) return;

    console.log('Setting up realtime subscription for board:', boardId);

    // Create a channel for this board
    const realtimeChannel = supabase
      .channel(`board-${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `column_id=in.(select id from columns where board_id=eq.${boardId})`
        },
        (payload: any) => {
          console.log('Card change detected:', payload);
          handleCardChange(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${boardId}`
        },
        (payload: any) => {
          console.log('Column change detected:', payload);
          handleColumnChange(payload);
        }
      )
      .subscribe((status: string) => {
        console.log('Realtime subscription status:', status);
      });

    setChannel(realtimeChannel);

    return () => {
      console.log('Cleaning up realtime subscription');
      realtimeChannel.unsubscribe();
    };
  }, [boardId]);

  const handleCardChange = (payload: any) => {
    // Trigger a refetch of cards
    // The parent component should handle this by calling getBoard again
    console.log('Card changed, triggering update');
  };

  const handleColumnChange = (payload: any) => {
    console.log('Column changed, triggering update');
  };

  return { channel };
}
