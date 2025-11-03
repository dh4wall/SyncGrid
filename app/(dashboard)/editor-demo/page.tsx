'use client';

import { useState, useCallback } from 'react';
import { AdvancedEditor } from '@/components/editor/advanced-editor';
import { Card } from '@/components/ui/card';
import { 
  Keyboard, 
  Slash, 
  Table as TableIcon, 
  Image as ImageIcon, 
  Type,
  List,
  Code,
  CheckSquare
} from 'lucide-react';

const initialContent = `
<h1>Welcome to the Advanced Editor! 🚀</h1>
<p>This is a powerful document editor with Confluence-like features. Here's what you can do:</p>

<h2>Quick Commands with /</h2>
<p>Type <code>/</code> anywhere to open the command menu and quickly insert:</p>
<ul>
  <li>Headings (H1, H2, H3)</li>
  <li>Lists (bullet, numbered, tasks)</li>
  <li>Tables with custom sizes</li>
  <li>Code blocks</li>
  <li>Images</li>
  <li>Quotes and dividers</li>
</ul>

<h2>Rich Text Formatting</h2>
<p>Use the toolbar or keyboard shortcuts:</p>
<ul>
  <li><strong>Bold</strong> - Ctrl/Cmd + B</li>
  <li><em>Italic</em> - Ctrl/Cmd + I</li>
  <li><u>Underline</u> - Ctrl/Cmd + U</li>
  <li><s>Strikethrough</s></li>
  <li><mark>Highlight</mark></li>
  <li><code>Inline code</code></li>
</ul>

<h2>Task Lists</h2>
<ul data-type="taskList">
  <li data-checked="true">Create amazing documents</li>
  <li data-checked="false">Add images and tables</li>
  <li data-checked="false">Collaborate in real-time (coming soon!)</li>
</ul>

<h2>Code Blocks</h2>
<pre><code>function hello() {
  console.log("Hello from the editor!");
  return "Amazing!";
}</code></pre>

<h2>Tables</h2>
<p>Type <code>/table</code> to insert a custom table:</p>

<h2>Images</h2>
<p>Type <code>/image</code> to upload or insert an image from URL</p>

<blockquote>
  <p>💡 Pro tip: All changes are autosaved. You can use markdown shortcuts like ** for bold and * for italic!</p>
</blockquote>

<hr>

<p>Start typing to explore all features! ✨</p>
`;

export default function EditorDemoPage() {
  const [content, setContent] = useState(initialContent);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const features = [
    {
      icon: Slash,
      title: 'Slash Commands',
      description: 'Type / to access quick commands for headings, lists, tables, and more'
    },
    {
      icon: Type,
      title: 'Rich Formatting',
      description: 'Bold, italic, underline, highlight, and inline code with keyboard shortcuts'
    },
    {
      icon: TableIcon,
      title: 'Custom Tables',
      description: 'Insert tables with custom rows and columns, resize columns'
    },
    {
      icon: ImageIcon,
      title: 'Image Support',
      description: 'Upload images or insert from URL with drag & drop support'
    },
    {
      icon: Code,
      title: 'Code Blocks',
      description: 'Syntax-highlighted code blocks for multiple languages'
    },
    {
      icon: CheckSquare,
      title: 'Task Lists',
      description: 'Interactive checklists to track your tasks'
    },
    {
      icon: List,
      title: 'Lists & Quotes',
      description: 'Bullet lists, numbered lists, and blockquotes'
    },
    {
      icon: Keyboard,
      title: 'Keyboard Shortcuts',
      description: 'Full keyboard support for efficient editing'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Document Editor</h1>
          <p className="mt-2 text-gray-600">
            Confluence-like editor with rich formatting, tables, code blocks, and more
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <feature.icon className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Keyboard Shortcuts */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">⌨️ Keyboard Shortcuts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Text Formatting</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Bold</span><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+B</kbd></div>
                <div className="flex justify-between"><span>Italic</span><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+I</kbd></div>
                <div className="flex justify-between"><span>Underline</span><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+U</kbd></div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Commands</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Slash menu</span><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">/</kbd></div>
                <div className="flex justify-between"><span>Undo</span><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Z</kbd></div>
                <div className="flex justify-between"><span>Redo</span><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+Z</kbd></div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Markdown</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Heading</span><kbd className="px-2 py-1 bg-gray-100 rounded text-xs"># + Space</kbd></div>
                <div className="flex justify-between"><span>Bullet list</span><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">- + Space</kbd></div>
                <div className="flex justify-between"><span>Code block</span><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">```</kbd></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Editor */}
        <div>
          <AdvancedEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Type '/' for commands, or start writing your document..."
          />
        </div>

        {/* Tips */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-bold mb-3 text-blue-900">💡 Pro Tips</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Use <code className="bg-blue-100 px-1 rounded">**text**</code> for bold and <code className="bg-blue-100 px-1 rounded">*text*</code> for italic (markdown shortcuts)</li>
            <li>• Press <code className="bg-blue-100 px-1 rounded">/</code> anywhere to open the command menu</li>
            <li>• Click on images and tables to resize or modify them</li>
            <li>• Use keyboard shortcuts for faster editing</li>
            <li>• All changes are automatically saved (when connected to database)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
