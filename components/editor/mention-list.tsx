'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export interface MentionSuggestion {
  id: string;
  label: string; // Display name
  email: string;
}

interface MentionListProps {
  items: MentionSuggestion[];
  command: (item: { id: string; label: string }) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.label });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="mention-list bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            key={item.id}
            className={`mention-item w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${
              index === selectedIndex
                ? 'bg-blue-100 text-blue-900'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => selectItem(index)}
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
              {item.label.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">
                {item.label}
              </div>
              <div className="text-xs text-gray-500 truncate">{item.email}</div>
            </div>
            {index === selectedIndex && (
              <div className="text-xs text-blue-600">↵</div>
            )}
          </button>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500">No users found</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';

export default MentionList;
