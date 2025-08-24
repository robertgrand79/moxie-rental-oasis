
import React, { useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { sanitizeRichTextContent } from '@/utils/security';
import { Button } from '@/components/ui/button';
import { Minus, Space, FileText, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ReactQuillEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const ReactQuillEditor = ({ content, onChange, placeholder = "Start writing...", className = "" }: ReactQuillEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  // Enhanced toolbar configuration with custom tools
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean'],
        ['spacer', 'divider', 'highlight-box']
      ],
      handlers: {
        'spacer': insertSpacer,
        'divider': insertDivider,
        'highlight-box': insertHighlightBox
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  // Custom content insertion functions
  function insertSpacer() {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, '\n\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n\n');
        quill.setSelection({ index: range.index + 4, length: 0 });
      }
    }
  }

  function insertDivider() {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n');
        quill.setSelection({ index: range.index + 124, length: 0 });
      }
    }
  }

  function insertHighlightBox() {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        const boxContent = '\n\n📌 HIGHLIGHT: Add your important content here...\n\n';
        quill.insertText(range.index, boxContent);
        quill.formatText(range.index + 2, boxContent.length - 4, { 
          'background': 'rgba(255, 235, 59, 0.2)',
          'border': '1px solid #FFC107',
          'padding': '12px',
          'border-radius': '8px'
        });
        quill.setSelection(range.index + 15, 35);
      }
    }
  }

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'color', 'background',
    'link', 'image', 'align', 'code-block', 'height', 'border', 'padding', 'border-radius'
  ];

  const handleChange = (value: string) => {
    console.log('📝 ReactQuill content changed:', value.substring(0, 100));
    onChange(value);
  };

  // Sync content prop changes with editor (only when different)
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (editor && content !== editor.root.innerHTML) {
      console.log('🔄 Syncing content prop with ReactQuill editor');
      editor.root.innerHTML = content;
    }
  }, [content]);

  // Custom toolbar component
  const CustomToolbar = () => (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30 rounded-t-md">
      <div className="flex gap-1 mr-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertSpacer}
          className="h-7 px-2 text-xs"
          title="Insert Spacer"
        >
          <Space className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertDivider}
          className="h-7 px-2 text-xs"
          title="Insert Divider"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertHighlightBox}
          className="h-7 px-2 text-xs"
          title="Insert Highlight Box"
        >
          <FileText className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`react-quill-container relative ${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .react-quill-container {
          position: relative;
          z-index: 1;
        }
        .react-quill-container .ql-toolbar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-bottom: none;
          border-radius: 0.5rem 0.5rem 0 0;
          backdrop-filter: blur(8px);
        }
        .react-quill-container .ql-container {
          border: 1px solid hsl(var(--border));
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
          font-family: inherit;
          background: hsl(var(--background));
        }
        .react-quill-container .ql-editor {
          min-height: 400px;
          font-size: 16px;
          line-height: 1.8;
          color: hsl(var(--foreground));
          padding: 1.5rem;
        }
        .react-quill-container .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        .react-quill-container .ql-editor h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 2rem 0 1rem 0;
          color: hsl(var(--foreground));
          line-height: 1.2;
        }
        .react-quill-container .ql-editor h2 {
          font-size: 2rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
          color: hsl(var(--foreground));
          line-height: 1.3;
        }
        .react-quill-container .ql-editor h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: hsl(var(--foreground));
          line-height: 1.4;
        }
        .react-quill-container .ql-editor p {
          margin: 1rem 0;
          line-height: 1.8;
        }
        .react-quill-container .ql-editor ul, .react-quill-container .ql-editor ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        .react-quill-container .ql-editor li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        .react-quill-container .ql-editor blockquote {
          border-left: 4px solid hsl(var(--primary));
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          background: hsl(var(--muted) / 0.5);
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        .react-quill-container .ql-editor .ql-code-block-container {
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          margin: 1rem 0;
          padding: 1rem;
        }
        .react-quill-container .ql-toolbar .ql-spacer:after,
        .react-quill-container .ql-toolbar .ql-divider:after,
        .react-quill-container .ql-toolbar .ql-highlight-box:after {
          content: '';
        }
        .react-quill-container .ql-toolbar .ql-spacer .ql-stroke,
        .react-quill-container .ql-toolbar .ql-divider .ql-stroke,
        .react-quill-container .ql-toolbar .ql-highlight-box .ql-stroke {
          display: none;
        }
        .react-quill-container .ql-toolbar .ql-picker {
          color: hsl(var(--foreground));
        }
        .react-quill-container .ql-toolbar button {
          color: hsl(var(--foreground));
        }
        .react-quill-container .ql-toolbar button:hover {
          color: hsl(var(--primary));
        }
        .react-quill-container .ql-toolbar button.ql-active {
          color: hsl(var(--primary));
        }
        .react-quill-container .ql-snow .ql-tooltip {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .react-quill-container .ql-snow .ql-tooltip input {
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          border-radius: 0.25rem;
          padding: 0.5rem;
        }
        @media (max-width: 768px) {
          .react-quill-container .ql-toolbar {
            position: relative;
          }
          .react-quill-container .ql-editor {
            min-height: 300px;
            padding: 1rem;
          }
        }
      `}} />
      
      <CustomToolbar />
      
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default ReactQuillEditor;
