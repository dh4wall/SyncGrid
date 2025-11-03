'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Table,
  Image as ImageIcon,
  Quote,
  Minus,
} from 'lucide-react';

interface CommandItem {
  title: string;
  description: string;
  icon: any;
  command: (props: any) => void;
}

interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
  editor: any;
  range: any;
}

function CommandListComponent({ items, command }: CommandListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const selectItem = useCallback((index: number) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  }, [items, command]);

  // Expose keyboard handler to parent
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectItem(selectedIndex);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, selectItem, items.length]);

  if (items.length === 0) {
    return (
      <div className="bg-white shadow-lg border rounded-lg p-4 min-w-[300px]">
        <p className="text-sm text-gray-500">No results</p>
      </div>
    );
  }

  return (
    <div 
      ref={commandListRef}
      className="bg-white shadow-lg border rounded-lg p-2 min-w-[300px] max-h-[400px] overflow-y-auto"
    >
      {items.map((item: CommandItem, index: number) => (
        <button
          key={item.title}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
          className={`w-full text-left px-3 py-2 rounded-md flex items-start gap-3 transition-colors ${
            index === selectedIndex
              ? 'bg-blue-50 text-blue-900'
              : 'hover:bg-gray-50'
          }`}
        >
          <item.icon className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{item.title}</div>
            <div className="text-xs text-gray-500">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const createSlashCommandSuggestion = (
  onTableCreate: () => void,
  onImageUpload: () => void
): Omit<SuggestionOptions, 'editor'> => ({
  char: '/',
  
  items: ({ query }: { query: string }) => {
    const commands: CommandItem[] = [
      {
        title: 'Heading 1',
        description: 'Large section heading',
        icon: Heading1,
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 1 })
            .run();
        },
      },
      {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: Heading2,
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 2 })
            .run();
        },
      },
      {
        title: 'Heading 3',
        description: 'Small section heading',
        icon: Heading3,
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 3 })
            .run();
        },
      },
      {
        title: 'Bullet List',
        description: 'Create a simple bullet list',
        icon: List,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
      },
      {
        title: 'Numbered List',
        description: 'Create a numbered list',
        icon: ListOrdered,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
      },
      {
        title: 'Task List',
        description: 'Track tasks with a checklist',
        icon: CheckSquare,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
      },
      {
        title: 'Code Block',
        description: 'Capture a code snippet',
        icon: Code,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
      },
      {
        title: 'Table',
        description: 'Insert a table',
        icon: Table,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).run();
          setTimeout(() => onTableCreate(), 0);
        },
      },
      {
        title: 'Image',
        description: 'Upload an image',
        icon: ImageIcon,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).run();
          setTimeout(() => onImageUpload(), 0);
        },
      },
      {
        title: 'Quote',
        description: 'Capture a quote',
        icon: Quote,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
      },
      {
        title: 'Divider',
        description: 'Visually divide blocks',
        icon: Minus,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
      },
    ];

    return commands.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  },

  render: () => {
    let component: ReactRenderer<any>;
    let popup: TippyInstance[];

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CommandListComponent, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }

        // Let the component handle arrow keys and enter
        if (['ArrowUp', 'ArrowDown', 'Enter'].includes(props.event.key)) {
          // Prevent default to stop editor from handling these keys
          props.event.preventDefault();
          return true;
        }

        return false;
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
});
