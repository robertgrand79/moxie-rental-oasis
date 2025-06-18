
import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { sanitizeRichTextContent } from '@/utils/security';

interface ReactQuillEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const ReactQuillEditor = ({ content, onChange, placeholder = "Start writing...", className = "" }: ReactQuillEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  // Toolbar configuration with all necessary formatting options
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'align', 'code-block'
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

  return (
    <div className={`react-quill-container ${className}`}>
      <style jsx>{`
        .react-quill-container .ql-editor {
          min-height: 300px;
          font-size: 16px;
          line-height: 1.6;
        }
        .react-quill-container .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
        }
        .react-quill-container .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          font-family: inherit;
        }
        .react-quill-container .ql-editor h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        .react-quill-container .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        .react-quill-container .ql-editor h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .react-quill-container .ql-editor p {
          margin: 0.5rem 0;
        }
        .react-quill-container .ql-editor ul, .react-quill-container .ql-editor ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .react-quill-container .ql-editor blockquote {
          border-left: 4px solid #ccc;
          margin: 1rem 0;
          padding-left: 1rem;
          font-style: italic;
        }
      `}</style>
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
