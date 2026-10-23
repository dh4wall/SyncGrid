'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X, Check, Loader2 } from 'lucide-react';
import { createColumn } from '@/lib/actions/boards';
import { cn } from '@/lib/utils';

interface AddColumnButtonProps {
  boardId: string;
  projectId: string;
  broadcastChannel?: any;
  onColumnCreated: (column: any) => void;
}

export function AddColumnButton({
  boardId,
  projectId,
  broadcastChannel,
  onColumnCreated,
}: AddColumnButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const handleSubmit = async () => {
    if (!title.trim() || loading) return;
    setLoading(true);
    try {
      const newColumn = await createColumn({ boardId, title: title.trim(), projectId });
      const columnWithCards = { ...newColumn, cards: [] };
      onColumnCreated(columnWithCards);
      if (broadcastChannel) {
        broadcastChannel.send({ type: 'broadcast', event: 'column-create', payload: { column: columnWithCards } });
      }
      setTitle('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to create column:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') { setIsAdding(false); setTitle(''); }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className={cn(
          'shrink-0 w-[300px] sm:w-[320px] h-16 flex items-center justify-center gap-2.5',
          'border-2 border-dashed border-[#c3c6d7]/60 rounded-2xl',
          'text-[#737686] hover:text-[#004ac6] hover:border-[#004ac6]/40',
          'hover:bg-[#eaedff]/40',
          'text-sm font-semibold transition-all',
        )}
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        <div className="w-7 h-7 rounded-xl bg-[#eaedff] group-hover:bg-[#dbe1ff] flex items-center justify-center">
          <Plus className="w-4 h-4 text-[#004ac6]" />
        </div>
        <span>Add Column</span>
      </button>
    );
  }

  return (
    <div className="shrink-0 w-[300px] sm:w-[320px]">
      <div className="bg-[#f2f3ff] rounded-2xl p-4 border-2 border-[#004ac6]/30 shadow-sm">
        <p className="text-[11px] font-bold text-[#737686] uppercase tracking-wider mb-2.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          New Column
        </p>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Column name…"
          maxLength={50}
          className="w-full bg-white border border-[#c3c6d7]/50 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/25 focus:border-[#004ac6]/30 transition-all mb-3 placeholder:text-[#c3c6d7]"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-[#0053db] to-[#004ac6] text-white text-sm font-bold shadow-sm shadow-blue-500/20 hover:from-[#1a65e8] hover:to-[#0053db] disabled:opacity-40 transition-all active:scale-[0.97]"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{loading ? 'Adding…' : 'Add'}</span>
          </button>
          <button
            onClick={() => { setIsAdding(false); setTitle(''); }}
            disabled={loading}
            className="p-2 rounded-xl text-[#737686] hover:bg-white hover:text-[#131b2e] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
