// Client-side queries - NO server actions, NO Next.js re-render
import { createClient } from '@/lib/supabase/client';

export async function getBoardClient(projectId: string) {
  const supabase = createClient();

  // Direct client query - INSTANT, no server roundtrip
  const { data: boards } = await supabase
    .from('boards')
    .select('*')
    .eq('project_id', projectId)
    .limit(1);

  if (!boards || boards.length === 0) return null;
  const board = boards[0];

  // Get columns
  const { data: columns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', board.id)
    .order('position', { ascending: true });

  if (!columns) return null;

  // Get all cards in one query
  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .in('column_id', columns.map(c => c.id))
    .order('position', { ascending: true });

  // Combine
  const columnsWithCards = columns.map(col => ({
    ...col,
    cards: (cards || []).filter(card => card.column_id === col.id)
  }));

  return { ...board, columns: columnsWithCards };
}

export async function getPageClient(pageId: string) {
  const supabase = createClient();

  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .single();

  return data;
}
