'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createCard } from '@/lib/actions/boards';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnId: string;
  columnTitle: string;
  projectId: string;
  onRefresh: () => void;
  broadcastChannel?: any;
}

const CARD_COLORS = [
  { name: 'Default', class: 'bg-white', border: 'border-[#c3c6d7]/60', dot: '#737686' },
  { name: 'Red',     class: 'bg-red-50',     border: 'border-red-200',    dot: '#ef4444' },
  { name: 'Orange',  class: 'bg-orange-50',  border: 'border-orange-200', dot: '#f97316' },
  { name: 'Yellow',  class: 'bg-amber-50',   border: 'border-amber-200',  dot: '#eab308' },
  { name: 'Green',   class: 'bg-emerald-50', border: 'border-emerald-200',dot: '#10b981' },
  { name: 'Blue',    class: 'bg-blue-50',    border: 'border-blue-200',   dot: '#3b82f6' },
  { name: 'Purple',  class: 'bg-purple-50',  border: 'border-purple-200', dot: '#8b5cf6' },
  { name: 'Pink',    class: 'bg-pink-50',    border: 'border-pink-200',   dot: '#ec4899' },
];

export function AddCardDialog({
  open,
  onOpenChange,
  columnId,
  columnTitle,
  projectId,
  onRefresh,
  broadcastChannel,
}: AddCardDialogProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-white');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const newCard = await createCard({
        columnId,
        title: title.trim(),
        description: description.trim(),
        color: selectedColor,
        projectId,
      });
      setTitle('');
      setDescription('');
      setSelectedColor('bg-white');
      onOpenChange(false);
      if (broadcastChannel && newCard) {
        broadcastChannel.send({ type: 'broadcast', event: 'card-create', payload: { card: newCard } });
      }
      onRefresh();
    } catch (error) {
      console.error('Failed to create card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-white/95 !backdrop-blur-2xl !border-[#c3c6d7]/40 !shadow-[0_32px_72px_rgba(15,23,42,0.18)] !rounded-2xl !p-0 !max-w-[420px] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#c3c6d7]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#eaedff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#004ac6] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                add_task
              </span>
            </div>
            <div>
              <h2 className="font-bold text-[#131b2e] text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                New Task
              </h2>
              <p className="text-[11px] text-[#737686]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                → {columnTitle}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#131b2e] uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-sm font-medium border border-[#c3c6d7]/40 focus:outline-none focus:ring-2 focus:ring-[#004ac6]/25 focus:bg-white focus:border-[#004ac6]/30 transition-all placeholder:text-[#c3c6d7]"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#131b2e] uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Details <span className="text-[#c3c6d7] font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, requirements, or notes…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-sm border border-[#c3c6d7]/40 focus:outline-none focus:ring-2 focus:ring-[#004ac6]/25 focus:bg-white focus:border-[#004ac6]/30 transition-all resize-none placeholder:text-[#c3c6d7] leading-relaxed"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            />
          </div>

          {/* Colour Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#131b2e] uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Card Colour
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {CARD_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.class)}
                  title={c.name}
                  className={cn(
                    'w-8 h-8 rounded-xl border-2 transition-all hover:scale-110 flex items-center justify-center',
                    c.class, c.border,
                    selectedColor === c.class ? 'ring-2 ring-[#004ac6] ring-offset-1 scale-105' : '',
                  )}
                >
                  {selectedColor === c.class && (
                    <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: c.dot }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#434655] hover:text-[#131b2e] text-sm font-semibold transition-all"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0053db] to-[#004ac6] hover:from-[#1a65e8] hover:to-[#0053db] text-white text-sm font-bold shadow-md shadow-blue-500/25 active:scale-[0.97] transition-all disabled:opacity-40"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {loading ? 'Adding…' : 'Add Task'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}