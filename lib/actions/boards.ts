'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getBoard(projectId: string) {
  const supabase = await createServerSupabaseClient();

  // Get board for project (use .limit(1) instead of .single())
  const { data: boards, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
    .limit(1);

  if (boardError || !boards || boards.length === 0) {
    console.error('Get board error:', boardError);
    return null;
  }

  const board = boards[0];

  // Get columns
  const { data: columns, error: columnsError } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', board.id)
    .order('position', { ascending: true });

  if (columnsError) {
    console.error('Get columns error:', columnsError);
    return null;
  }

  // Get cards for all columns
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .in('column_id', columns.map(c => c.id))
    .order('position', { ascending: true });

  if (cardsError) {
    console.error('Get cards error:', cardsError);
    return null;
  }

  // Group cards by column
  const columnsWithCards = columns.map(col => ({
    ...col,
    cards: (cards || []).filter(card => card.column_id === col.id)
  }));

  return {
    ...board,
    columns: columnsWithCards
  };
}

export async function createCard(data: {
  columnId: string;
  title: string;
  description?: string;
  color?: string;
  projectId: string;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get max position in column
  const { data: cards } = await supabase
    .from('cards')
    .select('position')
    .eq('column_id', data.columnId)
    .order('position', { ascending: false })
    .limit(1);

  const maxPosition = cards && cards.length > 0 ? cards[0].position : -1;

  const { data: card, error } = await supabase
    .from('cards')
    .insert({
      column_id: data.columnId,
      title: data.title,
      description: data.description,
      color: data.color || 'bg-white',
      position: maxPosition + 1,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Create card error:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${data.projectId}/board`);
  return card;
}

export async function updateCard(cardId: string, data: {
  title?: string;
  description?: string;
  color?: string;
  columnId?: string;
  position?: number;
  projectId: string;
}) {
  const supabase = await createServerSupabaseClient();

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.columnId !== undefined) updateData.column_id = data.columnId;
  if (data.position !== undefined) updateData.position = data.position;

  const { error } = await supabase
    .from('cards')
    .update(updateData)
    .eq('id', cardId);

  if (error) {
    console.error('Update card error:', error);
    throw new Error(error.message);
  }

  // Only revalidate for position/column changes (drag operations)
  // For title/description/color changes, use optimistic updates on the client
  if (data.columnId !== undefined || data.position !== undefined) {
    revalidatePath(`/projects/${data.projectId}/board`);
  }
}

export async function deleteCard(cardId: string, projectId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId);

  if (error) {
    console.error('Delete card error:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/board`);
}

export async function moveCard(data: {
  cardId: string;
  sourceColumnId: string;
  destColumnId: string;
  sourceIndex: number;
  destIndex: number;
  projectId: string;
}) {
  const supabase = await createServerSupabaseClient();

  // If moving within same column
  if (data.sourceColumnId === data.destColumnId) {
    // Get all cards in column
    const { data: cards } = await supabase
      .from('cards')
      .select('id, position')
      .eq('column_id', data.sourceColumnId)
      .order('position');

    if (!cards) return;

    // Reorder
    const reordered = Array.from(cards);
    const [removed] = reordered.splice(data.sourceIndex, 1);
    reordered.splice(data.destIndex, 0, removed);

    // Update positions
    for (let i = 0; i < reordered.length; i++) {
      await supabase
        .from('cards')
        .update({ position: i })
        .eq('id', reordered[i].id);
    }
  } else {
    // Moving to different column
    
    // First, get all cards from source column (excluding the moved card)
    const { data: sourceCards } = await supabase
      .from('cards')
      .select('id, position')
      .eq('column_id', data.sourceColumnId)
      .neq('id', data.cardId)
      .order('position');

    // Get all cards from destination column
    const { data: destCards } = await supabase
      .from('cards')
      .select('id, position')
      .eq('column_id', data.destColumnId)
      .order('position');

    // Reorder source column (remove the moved card)
    if (sourceCards) {
      for (let i = 0; i < sourceCards.length; i++) {
        await supabase
          .from('cards')
          .update({ position: i })
          .eq('id', sourceCards[i].id);
      }
    }

    // Insert the moved card into destination column at the correct position
    if (destCards) {
      // First, shift all cards at or after destIndex forward
      for (let i = destCards.length - 1; i >= data.destIndex; i--) {
        await supabase
          .from('cards')
          .update({ position: i + 1 })
          .eq('id', destCards[i].id);
      }
    }

    // Now move the card to its new column and position
    await supabase
      .from('cards')
      .update({
        column_id: data.destColumnId,
        position: data.destIndex
      })
      .eq('id', data.cardId);
  }

  revalidatePath(`/projects/${data.projectId}/board`);
}