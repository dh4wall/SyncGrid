'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Palette } from 'lucide-react';
import { updateCard, deleteCard } from '@/lib/actions/boards';
import { Button } from '@/components/ui/button';

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
}

const CARD_COLORS = [
  { name: 'White', class: 'bg-white', border: 'border-gray-300' },
  { name: 'Red', class: 'bg-red-200', border: 'border-red-400' },
  { name: 'Orange', class: 'bg-orange-200', border: 'border-orange-400' },
  { name: 'Yellow', class: 'bg-yellow-200', border: 'border-yellow-400' },
  { name: 'Green', class: 'bg-green-200', border: 'border-green-400' },
  { name: 'Blue', class: 'bg-blue-200', border: 'border-blue-400' },
  { name: 'Purple', class: 'bg-purple-200', border: 'border-purple-400' },
  { name: 'Pink', class: 'bg-pink-200', border: 'border-pink-400' },
];

export function KanbanCard({ card, projectId, onRefresh, onUpdate }: KanbanCardProps) {
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
    disabled: isEditing, // Disable dragging when editing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const currentColor = CARD_COLORS.find(c => c.class === card.color) || CARD_COLORS[0];

  const handleSave = async () => {
    if (title.trim()) {
      const updates = {
        title: title.trim(),
        description: description.trim(),
      };
      
      // Optimistic update - update UI immediately
      if (onUpdate) {
        onUpdate(card.id, updates);
      }
      
      // Save to database in the background
      await updateCard(card.id, {
        ...updates,
        projectId,
      });
      
      setIsEditing(false);
    }
  };

  const handleColorChange = async (color: string) => {
    // Optimistic update - update UI immediately
    if (onUpdate) {
      onUpdate(card.id, { color });
    }
    
    // Save to database in the background
    await updateCard(card.id, {
      color,
      projectId,
    });
    
    setShowColorPicker(false);
  };

  const handleDelete = async () => {
    if (confirm('Delete this card?')) {
      setIsDeleting(true);
      await deleteCard(card.id, projectId);
      if (onRefresh) {
        onRefresh(); // Refresh board after deletion
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
      className={`${currentColor.class} border ${currentColor.border} rounded-lg p-3 shadow-sm hover:shadow-md transition-all ${
        isDragging ? 'cursor-grabbing shadow-xl' : 'cursor-grab'
      } ${isEditing ? 'cursor-auto' : ''} group relative`}
    >
      {/* Card Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowColorPicker(!showColorPicker);
          }}
          className="p-1 hover:bg-gray-200 rounded"
          title="Change color"
        >
          <Palette className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="p-1 hover:bg-red-100 rounded"
          title="Delete card"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {/* Color Picker */}
      {showColorPicker && (
        <div 
          className="absolute top-10 right-2 bg-white border rounded-lg shadow-lg p-2 z-20 grid grid-cols-4 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {CARD_COLORS.map((color) => (
            <button
              key={color.class}
              onClick={(e) => {
                e.stopPropagation();
                handleColorChange(color.class);
              }}
              className={`w-8 h-8 ${color.class} border ${color.border} rounded hover:scale-110 transition-transform ${
                color.class === card.color ? 'ring-2 ring-blue-500' : ''
              }`}
              title={color.name}
            />
          ))}
        </div>
      )}

      {/* Card Content */}
      {isEditing ? (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Card title"
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
            className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setTitle(card.title);
                setDescription(card.description || '');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }} 
          className="pr-16"
        >
          <h4 className="font-medium text-sm mb-1 text-gray-800">{card.title}</h4>
          {card.description && (
            <p className="text-xs text-gray-600 line-clamp-3">{card.description}</p>
          )}
        </div>
      )}
    </div>
  );
}