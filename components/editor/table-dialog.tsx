'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (rows: number, cols: number) => void;
}

export function TableDialog({ open, onOpenChange, onInsert }: TableDialogProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleInsert = () => {
    if (rows > 0 && cols > 0 && rows <= 20 && cols <= 10) {
      onInsert(rows, cols);
      onOpenChange(false);
      // Reset values
      setRows(3);
      setCols(3);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rows</label>
            <Input
              type="number"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              placeholder="Number of rows"
            />
            <p className="text-xs text-gray-500">Max 20 rows</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Columns</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              placeholder="Number of columns"
            />
            <p className="text-xs text-gray-500">Max 10 columns</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleInsert}>Insert Table</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
