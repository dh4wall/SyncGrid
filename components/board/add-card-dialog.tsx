'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createCard } from '@/lib/actions/boards';

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnId: string;
  columnTitle: string;
  projectId: string;
  onRefresh: () => void;
}

const CARD_COLORS = [
  { name: 'White', class: 'bg-white', border: 'border-gray-200' },
  { name: 'Red', class: 'bg-red-50', border: 'border-red-200' },
  { name: 'Orange', class: 'bg-orange-50', border: 'border-orange-200' },
  { name: 'Yellow', class: 'bg-yellow-50', border: 'border-yellow-200' },
  { name: 'Green', class: 'bg-green-50', border: 'border-green-200' },
  { name: 'Blue', class: 'bg-blue-50', border: 'border-blue-200' },
  { name: 'Purple', class: 'bg-purple-50', border: 'border-purple-200' },
  { name: 'Pink', class: 'bg-pink-50', border: 'border-pink-200' },
];

export function AddCardDialog({
  open,
  onOpenChange,
  columnId,
  columnTitle,
  projectId,
  onRefresh,
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
      await createCard({
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
      onRefresh(); // Refresh board to show new card immediately
    } catch (error) {
      console.error('Failed to create card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Card to {columnTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Card Color</label>
            <div className="grid grid-cols-4 gap-2">
              {CARD_COLORS.map((color) => (
                <button
                  key={color.class}
                  type="button"
                  onClick={() => setSelectedColor(color.class)}
                  className={`h-12 ${color.class} border ${color.border} rounded-lg hover:scale-105 transition-transform ${
                    selectedColor === color.class ? 'ring-2 ring-blue-500' : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()} className="flex-1">
              {loading ? 'Adding...' : 'Add Card'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}