'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Card {
  id: string;
  title: string;
  description?: string;
  color: string;
  position: number;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  cards: Card[];
  onAddCard: () => void;
  projectId: string;
  onRefresh: () => void;
  onUpdate?: (cardId: string, updates: { title?: string; description?: string; color?: string }) => void;
}

export function KanbanColumn({ id, title, cards, onAddCard, projectId, onRefresh, onUpdate }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  console.log(`🔵 KanbanColumn ${title} received ${cards.length} cards:`, cards.map(c => c.title));

  return (
    <div className="shrink-0 w-64 sm:w-72 md:w-80">
      <div className="bg-gray-100 rounded-lg p-3 sm:p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-sm sm:text-base text-gray-700">{title}</h3>
          <span className="text-xs sm:text-sm text-gray-500">{cards.length}</span>
        </div>

        <div
          ref={setNodeRef}
          className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto min-h-[200px]"
        >
          <SortableContext
            items={cards.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {cards.map((card) => (
              <KanbanCard 
                key={card.id} 
                card={card} 
                projectId={projectId}
                onRefresh={onRefresh}
                onUpdate={onUpdate}
              />
            ))}
          </SortableContext>
        </div>

        <Button
          onClick={onAddCard}
          variant="ghost"
          size="sm"
          className="mt-3 w-full justify-start text-xs sm:text-sm text-gray-600 hover:bg-white"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Add card
        </Button>
      </div>
    </div>
  );
}