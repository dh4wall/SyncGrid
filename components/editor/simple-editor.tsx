'use client';

import { useState } from 'react';

export function SimpleEditor() {
  const [content, setContent] = useState('');

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 bg-white">
        <h1 className="text-2xl font-bold">Document Editor</h1>
        <p className="text-sm text-gray-600 mt-1">
          Rich text editor will be integrated here (Tiptap + Yjs)
        </p>
      </div>
      <div className="flex-1 p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing... (This is a placeholder. Real editor coming next!)"
          className="w-full h-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}