import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Youtube from '@tiptap/extension-youtube';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorPicker } from './ColorPicker';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Square,
  Minus,
  Plus,
  Undo,
  Redo,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Youtube as YoutubeIcon,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  RotateCcw,
  Trash2,
  Type
} from 'lucide-react';
import { Separator as UISeparator } from '@/components/ui/separator';

interface TipTapNewsletterEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const TipTapNewsletterEditor: React.FC<TipTapNewsletterEditorProps> = ({
  content,
  onChange,
  placeholder = "Start creating your newsletter content...",
  className = ""
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Subscript,
      Superscript,
      Image.configure({
        HTMLAttributes: {
          class: 'newsletter-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'newsletter-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: 'newsletter-video',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  // Sync editor content when the content prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log('🔄 Syncing editor content - Old:', editor.getHTML().length, 'New:', content.length);
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addYoutubeVideo = () => {
    const url = window.prompt('Enter YouTube URL:');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  };

  const insertAdvancedTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  const addTableRow = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const addTableColumn = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const deleteTableRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  const deleteTableColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const insertSpacer = () => {
    editor.chain().focus().insertContent('<div class="newsletter-spacer" style="height: 24px; margin: 16px 0;"></div>').run();
  };

  const insertDivider = () => {
    editor.chain().focus().insertContent('<hr class="newsletter-divider" style="border: none; border-top: 2px solid #e5e7eb; margin: 24px 0;" />').run();
  };

  const insertHighlightBox = () => {
    editor.chain().focus().insertContent(
      '<div class="newsletter-highlight-box" style="background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;"><p>Highlight content goes here...</p></div>'
    ).run();
  };

  const insertCTABox = () => {
    editor.chain().focus().insertContent(
      '<div class="newsletter-cta-box" style="background-color: #eff6ff; border: 2px solid #3b82f6; padding: 24px; margin: 24px 0; border-radius: 8px; text-align: center;"><h3>Call to Action</h3><p>Add your compelling message here</p><a href="#" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 12px;">Learn More</a></div>'
    ).run();
  };

  const insertMultiColumnLayout = () => {
    editor.chain().focus().insertContent(
      '<div class="newsletter-columns" style="display: flex; gap: 16px; margin: 24px 0;"><div style="flex: 1; padding: 16px; border: 1px solid #e5e7eb; border-radius: 4px;"><p>Column 1 content...</p></div><div style="flex: 1; padding: 16px; border: 1px solid #e5e7eb; border-radius: 4px;"><p>Column 2 content...</p></div></div>'
    ).run();
  };

  return (
    <div className={`newsletter-editor border border-border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-3">
        <div className="flex flex-wrap gap-2 items-center">
          {/* History Controls */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <UISeparator orientation="vertical" className="h-6" />

          {/* Headings */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('heading', { level: 4 }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            >
              <Heading4 className="h-4 w-4" />
            </Button>
          </div>

          <UISeparator orientation="vertical" className="h-6" />

          {/* Text Formatting */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={editor.isActive('bold') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('italic') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('underline') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('strike') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('subscript') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
            >
              <SubscriptIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('superscript') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
            >
              <SuperscriptIcon className="h-4 w-4" />
            </Button>
          </div>

          <UISeparator orientation="vertical" className="h-6" />

          {/* Colors */}
          <div className="flex gap-1">
            <ColorPicker
              color={editor.getAttributes('textStyle').color}
              onChange={setTextColor}
              icon={<Palette className="h-4 w-4" />}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={clearFormatting}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <UISeparator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          <UISeparator orientation="vertical" className="h-6" />

          {/* Lists */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={editor.isActive('bulletList') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('orderedList') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('blockquote') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          <UISeparator orientation="vertical" className="h-6" />

          {/* Media & Links */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={addImage}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={addLink}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={addYoutubeVideo}
            >
              <YoutubeIcon className="h-4 w-4" />
            </Button>
          </div>

          <UISeparator orientation="vertical" className="h-6" />

          {/* Table Controls */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={insertAdvancedTable}
              title="Insert Table"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            {editor.isActive('table') && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addTableRow}
                  title="Add Row"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addTableColumn}
                  title="Add Column"
                >
                  <Plus className="h-3 w-3 rotate-90" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteTableRow}
                  title="Delete Row"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteTableColumn}
                  title="Delete Column"
                >
                  <Trash2 className="h-3 w-3 rotate-90" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteTable}
                  title="Delete Table"
                >
                  <TableIcon className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </div>

          <UISeparator orientation="vertical" className="h-6" />

          {/* Newsletter Elements */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={insertSpacer}
              title="Add Spacer"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={insertDivider}
              title="Add Divider"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={insertHighlightBox}
              title="Add Highlight Box"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={insertCTABox}
              title="Add CTA Box"
              className="text-xs px-2"
            >
              CTA
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={insertMultiColumnLayout}
              title="Add Columns"
              className="text-xs px-2"
            >
              Cols
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
        <EditorContent 
          editor={editor} 
          className="newsletter-editor-content"
        />
      </div>

      <style>{`
        .newsletter-editor-content .ProseMirror {
          outline: none;
          min-height: 400px;
          padding: 1rem;
        }
        
        .newsletter-editor-content .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .newsletter-editor-content .newsletter-image {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 16px 0;
        }

        .newsletter-editor-content .newsletter-link {
          color: #3b82f6;
          text-decoration: underline;
        }

        .newsletter-editor-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
        }

        .newsletter-editor-content table th,
        .newsletter-editor-content table td {
          border: 1px solid #d1d5db;
          padding: 8px;
        }

        .newsletter-editor-content table th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        .newsletter-editor-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
        }

        .newsletter-editor-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 24px 0 16px 0;
          line-height: 1.2;
        }

        .newsletter-editor-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 20px 0 12px 0;
          line-height: 1.3;
        }

        .newsletter-editor-content h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 16px 0 8px 0;
          line-height: 1.4;
        }

        .newsletter-editor-content p {
          margin: 12px 0;
          line-height: 1.6;
        }

        .newsletter-editor-content ul,
        .newsletter-editor-content ol {
          margin: 12px 0;
          padding-left: 24px;
        }

        .newsletter-editor-content li {
          margin: 4px 0;
        }
      `}</style>
    </div>
  );
};

export default TipTapNewsletterEditor;