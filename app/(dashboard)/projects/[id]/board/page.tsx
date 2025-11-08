'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from '@/components/board/kanban-column';
import { KanbanCard } from '@/components/board/kanban-card';
import { AddCardDialog } from '@/components/board/add-card-dialog';
import { ActiveUsers } from '@/components/board/active-users';
import { CursorPresence } from '@/components/presence/cursor-presence';
import { moveCard } from '@/lib/actions/boards';
import { getBoardClient } from '@/lib/queries/client';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { useUser } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';


export default function BoardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useUser();

  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<any>(null);
  const [remoteDragStates, setRemoteDragStates] = useState<Map<string, {
    cardId: string;
    userId: string;
    userName: string;
    userColor: string;
    card: any;
    cursorX: number;
    cursorY: number;
  }>>(new Map());
  const broadcastChannelRef = useRef<any>(null);
  const boardIdRef = useRef<string | null>(null); 
  const isChannelSetupRef = useRef(false); 
  const [addCardDialog, setAddCardDialog] = useState<{
    open: boolean;
    columnId: string;
    columnTitle: string;
  }>({ open: false, columnId: '', columnTitle: '' });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    const initBoard = async () => {
      const data = await getBoardClient(projectId);
      setBoard(data);
      setLoading(false);
      
      if (data?.id) {
        boardIdRef.current = data.id;
      }
    };
    
    initBoard();
  }, [projectId]);

  
  useEffect(() => {
    if (!boardIdRef.current || isChannelSetupRef.current) return;

    const supabase = createClient();

    isChannelSetupRef.current = true;

    const broadcastCh = supabase.channel(`board-broadcast-${boardIdRef.current}`, {
      config: { 
        broadcast: { self: false },
        presence: { key: '' }
      }
    });

    broadcastCh
      .on('broadcast', { event: 'drag-start' }, (payload: any) => {
        const { cardId, userId, userName, userColor, card } = payload.payload;
        setRemoteDragStates(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, { cardId, userId, userName, userColor, card, cursorX: 0, cursorY: 0 });
          return newMap;
        });
      })
      .on('broadcast', { event: 'drag-move' }, (payload: any) => {
        const { userId, x, y } = payload.payload;
        setRemoteDragStates(prev => {
          const existing = prev.get(userId);
          if (!existing) return prev;
          const newMap = new Map(prev);
          newMap.set(userId, { ...existing, cursorX: x, cursorY: y });
          return newMap;
        });
      })
      .on('broadcast', { event: 'drag-end' }, (payload: any) => {
        const { userId } = payload.payload;
        setRemoteDragStates(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      })
      .on('broadcast', { event: 'user-leave' }, (payload: any) => {
        const { userId } = payload.payload;
        setRemoteDragStates(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      })
      .on('broadcast', { event: 'move' }, (payload: any) => {
        const { cardId, sourceColumnId, destColumnId, destIndex } = payload.payload;
        
        setBoard((prevBoard: any) => {
          if (!prevBoard) return prevBoard;

          const sourceCol = prevBoard.columns.find((col: any) => col.id === sourceColumnId);
          const destCol = prevBoard.columns.find((col: any) => col.id === destColumnId);
          
          if (!sourceCol || !destCol) return prevBoard;

          const cardToMove = sourceCol.cards.find((c: any) => c.id === cardId);
          if (!cardToMove) return prevBoard;

          const newSourceCards = sourceCol.cards.filter((c: any) => c.id !== cardId);
          
          const newDestCards = [...destCol.cards];
          if (sourceColumnId === destColumnId) {
            const oldIndex = sourceCol.cards.findIndex((c: any) => c.id === cardId);
            newDestCards.splice(oldIndex, 1);
            newDestCards.splice(destIndex, 0, cardToMove);
          } else {
            newDestCards.splice(destIndex, 0, { ...cardToMove, column_id: destColumnId });
          }

          return {
            ...prevBoard,
            columns: prevBoard.columns.map((col: any) => {
              if (col.id === sourceColumnId) {
                return sourceColumnId === destColumnId 
                  ? { ...col, cards: newDestCards }
                  : { ...col, cards: newSourceCards };
              }
              if (col.id === destColumnId && sourceColumnId !== destColumnId) {
                return { ...col, cards: newDestCards };
              }
              return col;
            }),
          };
        });
      })
      .on('broadcast', { event: 'update' }, (payload: any) => {
        const { cardId, updates } = payload.payload;
        setBoard((prevBoard: any) => {
          if (!prevBoard) return prevBoard;
          return {
            ...prevBoard,
            columns: prevBoard.columns.map((col: any) => ({
              ...col,
              cards: col.cards.map((card: any) =>
                card.id === cardId ? { ...card, ...updates } : card
              ),
            })),
          };
        });
      })
      .subscribe((status) => {
      });

    broadcastChannelRef.current = broadcastCh;

    const handleBeforeUnload = () => {
      if (user?.id) {
        broadcastCh.send({
          type: 'broadcast',
          event: 'user-leave',
          payload: { userId: user.id }
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    const handleVisibilityChange = () => {
      if (document.hidden && user?.id) {
        broadcastCh.send({
          type: 'broadcast',
          event: 'user-leave',
          payload: { userId: user.id }
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (user?.id) {
        broadcastCh.send({
          type: 'broadcast',
          event: 'user-leave',
          payload: { userId: user.id }
        });
      }
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      isChannelSetupRef.current = false;
      supabase.removeChannel(broadcastCh);
    };
  }, [boardIdRef.current, user?.id]); 

  const loadBoard = async () => {
    const data = await getBoardClient(projectId);
    setBoard(data);
  };

  const getUserColor = () => {
    if (!user?.id) return '#3B82F6';
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const hash = user.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleCardUpdate = useCallback((cardId: string, updates: { title?: string; description?: string; color?: string }) => {
    setBoard((prevBoard: any) => {
      if (!prevBoard) return prevBoard;

      return {
        ...prevBoard,
        columns: prevBoard.columns.map((col: any) => ({
          ...col,
          cards: col.cards.map((card: any) =>
            card.id === cardId ? { ...card, ...updates } : card
          ),
        })),
      };
    });

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.send({
        type: 'broadcast',
        event: 'update',
        payload: { cardId, updates }
      });
    } else {
    }
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const cardId = active.id as string;
    setActiveId(cardId);
    const card = board?.columns?.flatMap((col: any) => col.cards)?.find((c: any) => c.id === cardId);
    setActiveCard(card);

    if (broadcastChannelRef.current && user && card) {
      broadcastChannelRef.current.send({
        type: 'broadcast',
        event: 'drag-start',
        payload: {
          cardId,
          userId: user.id,
          userName: user.email?.split('@')[0] || 'Anonymous',
          userColor: getUserColor(),
          card
        }
      });
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    if (broadcastChannelRef.current && user && activeId) {
      const { activatorEvent } = event;
      if (activatorEvent && 'clientX' in activatorEvent && 'clientY' in activatorEvent) {
        broadcastChannelRef.current.send({
          type: 'broadcast',
          event: 'drag-move',
          payload: {
            userId: user.id,
            x: activatorEvent.clientX,
            y: activatorEvent.clientY
          }
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    const draggedCardId = activeId;
    setActiveId(null);
    setActiveCard(null);

    if (broadcastChannelRef.current && user && draggedCardId) {
      broadcastChannelRef.current.send({
        type: 'broadcast',
        event: 'drag-end',
        payload: { userId: user.id, cardId: draggedCardId }
      });
    }

    if (!over || !board) return;

    const activeCardId = active.id as string;
    const overColumnId = over.id as string;

    const activeColumn = board.columns.find((col: any) =>
      col.cards.some((card: any) => card.id === activeCardId)
    );

    if (!activeColumn) return;

    const overColumn = board.columns.find((col: any) => col.id === overColumnId) ||
      board.columns.find((col: any) => col.cards.some((card: any) => card.id === overColumnId));

    if (!overColumn) return;

    const activeCardIndex = activeColumn.cards.findIndex((c: any) => c.id === activeCardId);
    const activeCardData = activeColumn.cards[activeCardIndex];

    if (activeColumn.id === overColumn.id) {
      const overCardIndex = overColumn.cards.findIndex((c: any) => c.id === overColumnId);
      if (overCardIndex === -1) return;

      const newCards = arrayMove(activeColumn.cards, activeCardIndex, overCardIndex);

      setBoard({
        ...board,
        columns: board.columns.map((col: any) =>
          col.id === activeColumn.id ? { ...col, cards: newCards } : col
        ),
      });

      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.send({
          type: 'broadcast',
          event: 'move',
          payload: { 
            cardId: activeCardId,
            sourceColumnId: activeColumn.id,
            destColumnId: overColumn.id,
            destIndex: overCardIndex
          }
        });
      }

      moveCard({
        cardId: activeCardId,
        sourceColumnId: activeColumn.id,
        destColumnId: overColumn.id,
        sourceIndex: activeCardIndex,
        destIndex: overCardIndex,
        projectId,
      }).catch(err => {});
    } else {
      const newActiveCards = activeColumn.cards.filter((c: any) => c.id !== activeCardId);
      const overCardIndex = overColumn.cards.findIndex((c: any) => c.id === overColumnId);
      const insertIndex = overCardIndex === -1 ? overColumn.cards.length : overCardIndex;

      const newOverCards = [...overColumn.cards];
      newOverCards.splice(insertIndex, 0, { ...activeCardData, column_id: overColumn.id });

      setBoard({
        ...board,
        columns: board.columns.map((col: any) => {
          if (col.id === activeColumn.id) return { ...col, cards: newActiveCards };
          if (col.id === overColumn.id) return { ...col, cards: newOverCards };
          return col;
        }),
      });

      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.send({
          type: 'broadcast',
          event: 'move',
          payload: { 
            cardId: activeCardId,
            sourceColumnId: activeColumn.id,
            destColumnId: overColumn.id,
            destIndex: insertIndex
          }
        });
      }

      moveCard({
        cardId: activeCardId,
        sourceColumnId: activeColumn.id,
        destColumnId: overColumn.id,
        sourceIndex: activeCardIndex,
        destIndex: insertIndex,
        projectId,
      }).catch(err => {});
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!board || !board.columns) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No board found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-linear-to-br from-blue-50 via-white to-purple-50">
      {user && board && (
        <CursorPresence
          roomId={board.id}
          roomType="board"
          currentUser={{
            id: user.id,
            name: user.email?.split('@')[0] || 'Anonymous',
            color: getUserColor()
          }}
        />
      )}

      <div className="flex-none px-4 py-3 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kanban Board</h2>
        <ActiveUsers roomId={board.id} roomType="board" />
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-4 h-full">
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
                onRefresh={loadBoard}
                onUpdate={handleCardUpdate}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeId && activeCard ? (
            <div className="rotate-3 opacity-80">
              <KanbanCard card={activeCard} projectId={projectId} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {Array.from(remoteDragStates.values()).map(({ userId, userName, userColor, card, cursorX, cursorY }) => (
        <div
          key={userId}
          className="fixed pointer-events-none z-50 transition-transform duration-75"
          style={{
            left: cursorX,
            top: cursorY,
            transform: 'translate(-50%, -50%) rotate(3deg)',
          }}
        >
          <div className="relative opacity-70">
            <KanbanCard card={card} projectId={projectId} />
            <div
              className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
              style={{ backgroundColor: userColor }}
            >
              {userName}
            </div>
          </div>
        </div>
      ))}

      <AddCardDialog
        open={addCardDialog.open}
        columnId={addCardDialog.columnId}
        columnTitle={addCardDialog.columnTitle}
        projectId={projectId}
        onOpenChange={(open) =>
          setAddCardDialog({ ...addCardDialog, open })
        }
        onRefresh={loadBoard}
      />
    </div>
  );
}