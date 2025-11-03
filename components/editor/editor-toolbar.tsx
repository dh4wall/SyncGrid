'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Link as LinkIcon,
  Table,
  Image as ImageIcon,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface EditorToolbarProps {
  editor: Editor;
  onTableCreate: () => void;
  onImageUpload: () => void;
}

export function EditorToolbar({ editor, onTableCreate, onImageUpload }: EditorToolbarProps) {
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border-b bg-white sticky top-0 z-10 p-1.5 sm:p-2 flex flex-wrap gap-0.5 sm:gap-1 items-center overflow-x-auto">
      {/* History */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <Undo className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <Redo className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>

      <Separator orientation="vertical" className="h-4 sm:h-6 mx-0.5 sm:mx-1" />

      {/* Text Formatting */}
      <Button
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <Bold className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <Italic className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <UnderlineIcon className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <Strikethrough className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('code') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <Code className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        title="Highlight"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:inline-flex"
      >
        <Highlighter className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>

      <Separator orientation="vertical" className="h-4 sm:h-6 mx-0.5 sm:mx-1" />

      {/* Headings */}
      <Button
        variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <Heading1 className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <Heading2 className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden md:inline-flex"
      >
        <Heading3 className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>

      <Separator orientation="vertical" className="h-4 sm:h-6 mx-0.5 sm:mx-1" />

      {/* Lists */}
      <Button
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <List className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <ListOrdered className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('taskList') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        title="Task List"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:inline-flex"
      >
        <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>

      <Separator orientation="vertical" className="h-4 sm:h-6 mx-0.5 sm:mx-1 hidden md:block" />

      {/* Alignment */}
      <Button
        variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        title="Align Left"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden md:inline-flex"
      >
        <AlignLeft className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        title="Align Center"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden md:inline-flex"
      >
        <AlignCenter className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        title="Align Right"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden md:inline-flex"
      >
        <AlignRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>

      <Separator orientation="vertical" className="h-4 sm:h-6 mx-0.5 sm:mx-1" />

      {/* Other Elements */}
      <Button
        variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Quote"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:inline-flex"
      >
        <Quote className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:inline-flex"
      >
        <Code2 className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant={editor.isActive('link') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={setLink}
        title="Insert Link"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden md:inline-flex"
      >
        <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onTableCreate}
        title="Insert Table"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <Table className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onImageUpload}
        title="Upload Image"
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
    </div>
  );
}
