'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Link } from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Typography } from '@tiptap/extension-typography';
import { common, createLowlight } from 'lowlight';
import { useState, useCallback, useEffect } from 'react';
import { EditorToolbar } from './editor-toolbar';
import { TableDialog } from './table-dialog';
import { ImageDialog } from './image-dialog';
import { ResizableImage } from './resizable-image';
import { SlashCommand, createSlashCommandSuggestion } from './slash-command';
import './editor-styles.css';

const lowlight = createLowlight(common);

interface AdvancedEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
}

export function AdvancedEditor({
  content = '',
  onChange,
  editable = true,
  placeholder = "Type '/' for commands, or start writing...",
}: AdvancedEditorProps) {
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTableCreate = useCallback(() => {
    setTableDialogOpen(true);
  }, []);

  const handleImageUpload = useCallback(() => {
    setImageDialogOpen(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      ResizableImage,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none pl-0',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      SlashCommand.configure({
        suggestion: createSlashCommandSuggestion(handleTableCreate, handleImageUpload),
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none p-8 min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
  });

  const handleInsertTable = (rows: number, cols: number) => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: true })
        .run();
    }
  };

  const handleInsertImage = (url: string) => {
    if (editor) {
      editor.chain().focus().insertContent({
        type: 'resizableImage',
        attrs: { src: url },
      }).run();
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || !editor) {
    return (
      <div className="border rounded-lg bg-white">
        <div className="h-[600px] flex items-center justify-center">
          <p className="text-gray-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      {editable && (
        <EditorToolbar
          editor={editor}
          onTableCreate={handleTableCreate}
          onImageUpload={handleImageUpload}
        />
      )}
      
      <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
        <EditorContent editor={editor} />
      </div>

      <TableDialog
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        onInsert={handleInsertTable}
      />

      <ImageDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsert={handleInsertImage}
      />
    </div>
  );
}
