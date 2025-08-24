import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Table,
  Square,
  Minus,
  Plus
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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
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

  const insertTable = () => {
    editor.chain().focus().insertContent(
      '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;"><tr><th style="border: 1px solid #d1d5db; padding: 8px; background-color: #f9fafb;">Header 1</th><th style="border: 1px solid #d1d5db; padding: 8px; background-color: #f9fafb;">Header 2</th></tr><tr><td style="border: 1px solid #d1d5db; padding: 8px;">Cell 1</td><td style="border: 1px solid #d1d5db; padding: 8px;">Cell 2</td></tr></table>'
    ).run();
  };

  return (
    <div className={`newsletter-editor border border-border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-3">
        <div className="flex flex-wrap gap-2 items-center">
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
              onClick={insertTable}
            >
              <Table className="h-4 w-4" />
            </Button>
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