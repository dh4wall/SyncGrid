'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card';
import { Plus, Trash2 } from 'lucide-react';
import { deleteColumn } from '@/lib/actions/boards';
import { cn } from '@/lib/utils';

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
  broadcastChannel?: any;
  onDelete?: (columnId: string) => void;
}

// Status dot colours matching reference design
const COLUMN_ACCENT: Record<string, { dot: string; bg: string; border: string; badge: string }> = {
  'To Do':      { dot: '#737686', bg: '#f2f3ff', border: 'rgba(195,198,215,0.35)', badge: '#dae2fd' },
  'In Progress':{ dot: '#2563eb', bg: '#eff6ff', border: 'rgba(37,99,235,0.18)',   badge: '#dbeafe' },
  'In Review':  { dot: '#7c3aed', bg: '#f5f3ff', border: 'rgba(124,58,237,0.18)',  badge: '#ede9fe' },
  'Done':       { dot: '#059669', bg: '#f0fdf4', border: 'rgba(5,150,105,0.18)',   badge: '#d1fae5' },
};
const DEFAULT_ACCENT = { dot: '#737686', bg: '#f2f3ff', border: 'rgba(195,198,215,0.35)', badge: '#dae2fd' };

export function KanbanColumn({
  id, title, cards, onAddCard, projectId, onRefresh, onUpdate, broadcastChannel, onDelete,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const [isDeleting, setIsDeleting] = useState(false);

  const accent = COLUMN_ACCENT[title] || DEFAULT_ACCENT;

  const handleDelete = async () => {
    if (!confirm(`Delete column "${title}" and all its cards?`)) return;
    setIsDeleting(true);
    try {
      if (broadcastChannel) {
        broadcastChannel.send({ type: 'broadcast', event: 'column-delete', payload: { columnId: id } });
      }
      if (onDelete) onDelete(id);
      await deleteColumn({ columnId: id, projectId });
    } catch (err) {
      console.error('Failed to delete column:', err);
      onRefresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="shrink-0 w-[300px] sm:w-[320px] flex flex-col"
      style={{ height: 'calc(100vh - 210px)', minHeight: '400px' }}
    >
      <div
        className="rounded-2xl flex flex-col h-full shadow-sm"
        style={{
          background: accent.bg,
          border: `1.5px solid ${accent.border}`,
        }}
      >
        {/* ── Column Header ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 group">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Status dot */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: accent.dot, boxShadow: `0 0 0 3px ${accent.dot}22` }}
            />
            <h3
              className="font-bold text-sm text-[#131b2e] truncate"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {title}
            </h3>
            {/* Count badge */}
            <span
              className="shrink-0 text-[10px] font-bold rounded-full px-2 py-0.5 ml-0.5"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: accent.badge,
                color: '#434655',
              }}
            >
              {cards.length}
            </span>
          </div>

          {/* Actions (visible on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete column"
              className="p-1.5 rounded-lg text-[#737686] hover:text-red-500 hover:bg-red-50/80 transition-all disabled:opacity-30"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onAddCard}
              title="Add task"
              className="p-1.5 rounded-lg text-[#434655] hover:text-[#004ac6] hover:bg-white/70 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Cards Scroll Area ── */}
        <div
          ref={setNodeRef}
          className="flex-1 flex flex-col gap-2 overflow-y-auto px-3 sg-scrollbar-thin"
          style={{ paddingBottom: '4px' }}
        >
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                projectId={projectId}
                onRefresh={onRefresh}
                onUpdate={onUpdate}
                broadcastChannel={broadcastChannel}
              />
            ))}
          </SortableContext>
        </div>

        {/* ── Bottom Add Button ── */}
        <div className="px-3 pb-3 pt-2">
          <button
            onClick={onAddCard}
            className={cn(
              'w-full py-2.5 px-3 rounded-xl text-[#434655] hover:text-[#004ac6]',
              'flex items-center justify-center gap-1.5 text-[12px] font-semibold',
              'border border-dashed hover:border-[#004ac6]/50',
              'bg-transparent hover:bg-white/60',
              'transition-all',
            )}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', borderColor: `${accent.dot}40` }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
