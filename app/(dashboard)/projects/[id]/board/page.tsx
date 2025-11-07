'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from '@/components/board/kanban-column';
import { AddCardDialog } from '@/components/board/add-card-dialog';
import { ActiveUsers } from '@/components/board/active-users';
import { getBoard, moveCard } from '@/lib/actions/boards';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function BoardPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<any>(null);
  const [originalBoard, setOriginalBoard] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false); // Track if user is currently dragging
  const [syncing, setSyncing] = useState(false); // Track when receiving remote updates
  const [addCardDialog, setAddCardDialog] = useState<{
    open: boolean;
    columnId: string;
    columnTitle: string;
  }>({ open: false, columnId: '', columnTitle: '' });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    loadBoard();
  }, [projectId]);

  // Real-time subscription
  useEffect(() => {
    if (!board?.id) return;

    const supabase = createClient();
    console.log('🔴 Setting up realtime for board:', board.id);

    const channel = supabase
      .channel(`board-${board.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
        },
        (payload: any) => {
          console.log('🔴 Card change detected:', payload);
          // Only reload if we're not currently dragging
          if (!isDragging) {
            console.log('🔴 Reloading board due to card change');
            setSyncing(true);
            loadBoard().then(() => {
              setTimeout(() => setSyncing(false), 500);
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${board.id}`,
        },
        (payload: any) => {
          console.log('🔴 Column change detected:', payload);
          if (!isDragging) {
            console.log('🔴 Reloading board due to column change');
            setSyncing(true);
            loadBoard().then(() => {
              setTimeout(() => setSyncing(false), 500);
            });
          }
        }
      )
      .subscribe((status: string) => {
        console.log('🔴 Realtime status:', status);
      });

    return () => {
      console.log('🔴 Cleaning up realtime subscription');
      channel.unsubscribe();
    };
  }, [board?.id, isDragging]);

  const loadBoard = async () => {
    const data = await getBoard(projectId);
    setBoard(data);
    setLoading(false);
  };

  const refreshBoard = () => {
    loadBoard();
  };

  // Handle optimistic card updates (title, description, color)
  const handleCardUpdate = (cardId: string, updates: { title?: string; description?: string; color?: string }) => {
    setBoard((prevBoard: any) => {
      if (!prevBoard) return prevBoard;

      return {
        ...prevBoard,
        columns: prevBoard.columns.map((col: any) => ({
          ...col,
          cards: col.cards.map((card: any) =>
            card.id === cardId
              ? { ...card, ...updates }
              : card
          ),
        })),
      };
    });
  };

  const findCardAndColumn = (cardId: string) => {
    for (const col of board.columns) {
      const cardIndex = col.cards.findIndex((c: any) => c.id === cardId);
      if (cardIndex !== -1) {
        return {
          column: col,
          cardIndex,
          card: col.cards[cardIndex],
        };
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string;
    setActiveId(cardId);
    setIsDragging(true); // Set dragging flag

    // Store the original board state before any drag operations
    setOriginalBoard(JSON.parse(JSON.stringify(board)));

    // Find and store the active card for the overlay
    const result = findCardAndColumn(cardId);
    if (result) {
      setActiveCard(result.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source
    const activeResult = findCardAndColumn(activeId);
    if (!activeResult) return;

    // Check if over is a column or a card
    const overResult = findCardAndColumn(overId);
    const overColumn = overResult
      ? overResult.column
      : board.columns.find((col: any) => col.id === overId);

    if (!overColumn) return;

    // If dragging over different column, update local state for smooth animation
    if (activeResult.column.id !== overColumn.id) {
      setBoard((prev: any) => {
        const newColumns = prev.columns.map((col: any) => {
          if (col.id === activeResult.column.id) {
            // Remove from source
            return {
              ...col,
              cards: col.cards.filter((c: any) => c.id !== activeId),
            };
          }
          if (col.id === overColumn.id) {
            // Add to destination
            const newCards = [...col.cards];
            const insertIndex = overResult ? overResult.cardIndex : newCards.length;
            newCards.splice(insertIndex, 0, activeResult.card);
            return {
              ...col,
              cards: newCards,
            };
          }
          return col;
        });

        return { ...prev, columns: newColumns };
      });
    } else if (overResult) {
      // Reordering within same column
      setBoard((prev: any) => {
        const newColumns = prev.columns.map((col: any) => {
          if (col.id === activeResult.column.id) {
            const oldIndex = activeResult.cardIndex;
            const newIndex = overResult.cardIndex;
            return {
              ...col,
              cards: arrayMove(col.cards, oldIndex, newIndex),
            };
          }
          return col;
        });

        return { ...prev, columns: newColumns };
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveCard(null);

    if (!over || !originalBoard) {
      setOriginalBoard(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination from ORIGINAL board state
    const findInOriginal = (cardId: string) => {
      for (const col of originalBoard.columns) {
        const cardIndex = col.cards.findIndex((c: any) => c.id === cardId);
        if (cardIndex !== -1) {
          return { column: col, cardIndex, card: col.cards[cardIndex] };
        }
      }
      return null;
    };

    const activeResult = findInOriginal(activeId);
    if (!activeResult) {
      setOriginalBoard(null);
      return;
    }

    // IMPORTANT: Find destination in ORIGINAL board state too for same-column moves
    const overResult = findInOriginal(overId);
    
    // Determine destination column
    let destColumnId: string;
    let destIndex: number;
    
    if (overResult) {
      // Dropped on another card
      destColumnId = overResult.column.id;
      destIndex = overResult.cardIndex;
      
      // If moving within same column and dropping after itself, adjust index
      if (destColumnId === activeResult.column.id && destIndex > activeResult.cardIndex) {
        destIndex -= 1;
      }
    } else {
      // Dropped on column (empty area)
      const overColumn = originalBoard.columns.find((col: any) => col.id === overId);
      if (!overColumn) {
        setOriginalBoard(null);
        return;
      }
      destColumnId = overColumn.id;
      destIndex = overColumn.cards.length;
      
      // If dropping in same column, account for removed card
      if (destColumnId === activeResult.column.id) {
        destIndex -= 1;
      }
    }

    const sourceColumnId = activeResult.column.id;
    const sourceIndex = activeResult.cardIndex;

    // Only save if position actually changed
    if (sourceColumnId === destColumnId && sourceIndex === destIndex) {
      setOriginalBoard(null);
      return;
    }

    // Save to database - don't reload, keep the optimistic update
    try {
      await moveCard({
        cardId: activeId,
        sourceColumnId,
        destColumnId,
        sourceIndex,
        destIndex,
        projectId,
      });
      setOriginalBoard(null);
    } catch (error) {
      console.error('Failed to move card:', error);
      // On error, revert to original state
      setBoard(originalBoard);
      setOriginalBoard(null);
    } finally {
      setIsDragging(false); // Clear dragging flag
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveCard(null);
    setIsDragging(false); // Clear dragging flag
    // Revert to original state
    if (originalBoard) {
      setBoard(originalBoard);
      setOriginalBoard(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading board...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Board not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-3 sm:p-4 md:p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold">{board.name}</h1>
            {syncing && (
              <span className="text-sm text-blue-600 animate-pulse">
                🔄 Syncing...
              </span>
            )}
          </div>
          {board.id && <ActiveUsers roomId={board.id} roomType="board" />}
        </div>
        <p className="text-xs sm:text-sm text-gray-600">
          Drag cards to reorder or move between columns
        </p>
      </div>

      <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-3 sm:gap-4 md:gap-6 h-full min-w-max">
            {board.columns.map((column: any) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                cards={column.cards || []}
                onAddCard={() =>
                  setAddCardDialog({
                    open: true,
                    columnId: column.id,
                    columnTitle: column.title,
                  })
                }
                projectId={projectId}
                onRefresh={refreshBoard}
                onUpdate={handleCardUpdate}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className={`${activeCard.color} border rounded-lg p-3 shadow-xl w-64 sm:w-72 md:w-80 opacity-90`}>
                <h4 className="font-medium text-sm mb-1 text-gray-800">{activeCard.title}</h4>
                {activeCard.description && (
                  <p className="text-xs text-gray-600 line-clamp-3">{activeCard.description}</p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AddCardDialog
        open={addCardDialog.open}
        onOpenChange={(open) => setAddCardDialog({ ...addCardDialog, open })}
        columnId={addCardDialog.columnId}
        columnTitle={addCardDialog.columnTitle}
        projectId={projectId}
        onRefresh={refreshBoard}
      />
    </div>
  );
}