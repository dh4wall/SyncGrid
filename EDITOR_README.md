# Advanced Document Editor

A powerful, Confluence-like document editor built with Tiptap, featuring rich formatting, tables, code blocks, and slash commands.

## ✨ Features

### 🎯 Core Features
- **Rich Text Formatting**: Bold, italic, underline, strikethrough, highlight, and inline code
- **Headings**: 6 levels of headings (H1-H6)
- **Lists**: Bullet lists, numbered lists, and interactive task lists
- **Tables**: Customizable tables with resizable columns
- **Code Blocks**: Syntax-highlighted code blocks using Lowlight
- **Images**: Upload images or insert from URL
- **Links**: Clickable, editable hyperlinks
- **Blockquotes**: Beautiful quote styling
- **Horizontal Rules**: Visual dividers

### ⚡ Advanced Features
- **Slash Commands**: Type `/` to open a quick-insert menu
- **Typography**: Smart quotes and typographic replacements
- **Text Alignment**: Left, center, right alignment
- **Markdown Shortcuts**: Quick formatting with markdown syntax
- **Keyboard Shortcuts**: Full keyboard navigation and shortcuts
- **Drag & Drop**: Drag and drop images (coming soon)
- **Placeholder Text**: Helpful hints when editor is empty

## 🎨 Slash Commands

Type `/` anywhere in the document to access quick commands:

- `/heading1` - Large section heading
- `/heading2` - Medium section heading
- `/heading3` - Small section heading
- `/bullet` - Bullet list
- `/numbered` - Numbered list
- `/task` - Task list with checkboxes
- `/code` - Code block
- `/table` - Insert custom table (opens dialog)
- `/image` - Upload or insert image (opens dialog)
- `/quote` - Blockquote
- `/divider` - Horizontal rule

## ⌨️ Keyboard Shortcuts

### Text Formatting
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- `Ctrl/Cmd + Shift + S` - Strikethrough
- `Ctrl/Cmd + E` - Inline code
- `Ctrl/Cmd + Shift + H` - Highlight

### History
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo

### Markdown Shortcuts
- `# + Space` - Heading 1
- `## + Space` - Heading 2
- `### + Space` - Heading 3
- `- + Space` - Bullet list
- `1. + Space` - Numbered list
- `[] + Space` - Task list
- ` ``` ` - Code block
- `> + Space` - Blockquote

## 🛠️ Usage

### Basic Implementation

\`\`\`tsx
import { AdvancedEditor } from '@/components/editor/advanced-editor';

export default function MyPage() {
  const [content, setContent] = useState('');

  return (
    <AdvancedEditor
      content={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}
\`\`\`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `''` | Initial HTML content |
| `onChange` | `(content: string) => void` | - | Callback when content changes |
| `editable` | `boolean` | `true` | Whether the editor is editable |
| `placeholder` | `string` | `"Type '/' for commands..."` | Placeholder text |

## 📦 Components

### Main Components
- **AdvancedEditor**: Main editor component with all features
- **EditorToolbar**: Toolbar with formatting buttons
- **SlashCommand**: Slash command menu extension
- **TableDialog**: Dialog for custom table creation
- **ImageDialog**: Dialog for image upload/URL insertion

### UI Components Used
- Button
- Dialog
- Input
- Textarea
- Tabs
- Separator

## 🎯 Table Features

- **Custom Size**: Specify rows and columns when creating
- **Header Row**: First row is automatically styled as header
- **Resizable Columns**: Drag column borders to resize
- **Cell Selection**: Click and drag to select multiple cells
- **Add/Remove**: Right-click menu to add/remove rows and columns

## 🖼️ Image Features

- **URL Insertion**: Paste any image URL
- **File Upload**: Upload from your computer
- **Drag & Drop**: Drag images directly into the editor (coming soon)
- **Responsive**: Images scale to fit container
- **Selection**: Click to select and delete images

## 🔮 Coming Soon

- **Real-time Collaboration**: Multiple users editing simultaneously
- **Live Cursors**: See other users' cursors in real-time
- **Mentions**: @mention other users
- **Comments**: Add inline comments
- **Version History**: View and restore previous versions
- **Autosave**: Automatic saving to database
- **Offline Sync**: Work offline and sync when back online
- **Page Hierarchy**: Nested pages with breadcrumbs
- **Templates**: Pre-built document templates
- **Export**: Export to PDF, Markdown, HTML

## 🎨 Styling

The editor uses custom CSS with Tailwind classes. Key styles:

- Prose typography for consistent text formatting
- Syntax highlighting for code blocks
- Hover effects on interactive elements
- Selected node outlines
- Custom table borders and cell styles

## 🧪 Testing

To test the editor, visit:
- `/projects/[id]/editor` - Editor within a project
- `/editor-demo` - Standalone demo page with documentation

## 📝 Notes

- All content is stored as HTML
- Uses Tiptap (ProseMirror) under the hood
- Fully extensible with custom extensions
- Mobile-responsive design
- Accessibility-friendly

## 🐛 Known Issues

- Bubble menu not yet implemented (planned)
- File upload creates blob URLs (needs backend integration)
- Some keyboard shortcuts may conflict with browser shortcuts

## 📚 Learn More

- [Tiptap Documentation](https://tiptap.dev)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [Lowlight (Code Highlighting)](https://github.com/wooorm/lowlight)
