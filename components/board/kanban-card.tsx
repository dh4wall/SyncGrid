'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Palette, Check, X } from 'lucide-react';
import { updateCard, deleteCard } from '@/lib/actions/boards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Card {
  id: string;
  title: string;
  description?: string;
  color: string;
}

interface KanbanCardProps {
  card: Card;
  projectId: string;
  onRefresh?: () => void;
  onUpdate?: (cardId: string, updates: Partial<Card>) => void;
  broadcastChannel?: any;
}

const CARD_COLORS = [
  { name: 'Default', class: 'bg-white', border: 'border-[#c3c6d7]/40', badge: 'bg-[#eaedff] text-[#004ac6]', dot: '#737686' },
  { name: 'Red', class: 'bg-red-50/70', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: '#ef4444' },
  { name: 'Orange', class: 'bg-orange-50/70', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', dot: '#f97316' },
  { name: 'Yellow', class: 'bg-amber-50/70', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: '#eab308' },
  { name: 'Green', class: 'bg-emerald-50/70', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', dot: '#10b981' },
  { name: 'Blue', class: 'bg-blue-50/70', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', dot: '#3b82f6' },
  { name: 'Purple', class: 'bg-purple-50/70', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', dot: '#8b5cf6' },
  { name: 'Pink', class: 'bg-pink-50/70', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700', dot: '#ec4899' },
];

export function KanbanCard({ card, projectId, onRefresh, onUpdate, broadcastChannel }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isEditing, // Disable dragging while editing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  // Match existing color strings from DB (handles legacy classes like 'bg-red-200' gracefully)
  const currentColor =
    CARD_COLORS.find((c) => c.class === card.color || card.color?.includes(c.name.toLowerCase())) ||
    CARD_COLORS[0];

  const handleSave = () => {
    if (title.trim()) {
      const updates = {
        title: title.trim(),
        description: description.trim(),
      };

      // INSTANT: Update UI immediately + broadcast to others
      if (onUpdate) {
        onUpdate(card.id, updates);
      }

      // Save to database in background
      updateCard(card.id, {
        ...updates,
        projectId,
      }).catch((err) => console.error('Background save failed:', err));

      setIsEditing(false);
    }
  };

  const handleColorChange = (colorClass: string) => {
    // INSTANT: Update UI immediately + broadcast to others
    if (onUpdate) {
      onUpdate(card.id, { color: colorClass });
    }

    // Save to database in background
    updateCard(card.id, {
      color: colorClass,
      projectId,
    }).catch((err) => console.error('Background save failed:', err));

    setShowColorPicker(false);
  };

  const handleDelete = async () => {
    if (confirm('Delete this card?')) {
      setIsDeleting(true);
      if (broadcastChannel) {
        broadcastChannel.send({
          type: 'broadcast',
          event: 'card-delete',
          payload: { cardId: card.id },
        });
      }
      await deleteCard(card.id, projectId);
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  if (isDeleting) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative rounded-xl p-3.5 transition-all select-none',
        'border shadow-sm hover:shadow-md',
        currentColor.class,
        currentColor.border,
        isDragging ? 'cursor-grabbing shadow-xl scale-[1.02] ring-2 ring-[#004ac6]/30' : 'cursor-grab',
        isEditing && 'cursor-auto ring-2 ring-[#004ac6]'
      )}
    >
      {/* Action Buttons (Color & Delete) */}
      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-0.5 border border-[#c3c6d7]/30 shadow-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowColorPicker(!showColorPicker);
          }}
          className="p-1 hover:bg-[#eaedff] rounded text-[#737686] hover:text-[#004ac6] transition-colors"
          title="Change color"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="p-1 hover:bg-red-50 rounded text-[#737686] hover:text-red-600 transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popover Color Picker */}
      {showColorPicker && (
        <div
          className="absolute top-10 right-2 bg-white/98 backdrop-blur-xl border border-[#c3c6d7]/50 rounded-xl shadow-xl p-2 z-30 grid grid-cols-4 gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {CARD_COLORS.map((color) => (
            <button
              key={color.name}
              onClick={(e) => {
                e.stopPropagation();
                handleColorChange(color.class);
              }}
              className={cn(
                'w-6 h-6 rounded-lg border transition-transform hover:scale-110 flex items-center justify-center',
                color.class,
                color.border,
                (card.color === color.class || (!card.color && color.name === 'Default')) &&
                  'ring-2 ring-[#004ac6]'
              )}
              title={color.name}
            >
              {(card.color === color.class || (!card.color && color.name === 'Default')) && (
                <Check className="w-3 h-3 text-[#004ac6]" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Editing Mode */}
      {isEditing ? (
        <div className="space-y-2.5" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#c3c6d7] text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#004ac6]"
            placeholder="Task title"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === 'Escape') {
                setIsEditing(false);
                setTitle(card.title);
                setDescription(card.description || '');
              }
            }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-[#c3c6d7] text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#004ac6] resize-none leading-relaxed"
            placeholder="Add details (optional)..."
            rows={2}
          />
          <div className="flex items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setTitle(card.title);
                setDescription(card.description || '');
              }}
              className="px-2.5 py-1 text-xs rounded-lg hover:bg-gray-100 text-[#737686] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#004ac6] text-white hover:bg-[#003ea8] transition-colors shadow-xs"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        /* Normal Display Mode */
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="flex flex-col gap-1 pr-10 cursor-pointer"
        >
          {/* Subtle Tag / Dot if colored */}
          {currentColor.name !== 'Default' && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: currentColor.dot }}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {currentColor.name}
              </span>
            </div>
          )}

          <h4
            className="text-xs font-semibold text-[#131b2e] tracking-tight group-hover:text-[#004ac6] transition-colors leading-snug break-words"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {card.title}
          </h4>

          {card.description && (
            <p
              className="text-[11px] text-[#434655] line-clamp-3 leading-relaxed break-words mt-0.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {card.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}