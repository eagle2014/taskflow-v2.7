import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Code
} from 'lucide-react';
import { Button } from './ui/button';

// Create extensions ONCE outside component to prevent duplicate warning
const createExtensions = (placeholder: string) => [
  StarterKit.configure({}),
  Placeholder.configure({
    placeholder
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-[#0394ff] underline cursor-pointer'
    }
  })
];

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write something...',
  className = '',
  editable = true
}: RichTextEditorProps) {
  // Use ref to ensure extensions are created only once per component instance
  const extensionsRef = useRef(createExtensions(placeholder));

  const editor = useEditor({
    extensions: extensionsRef.current,
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[120px] px-3 py-2'
      }
    },
    // Prevent hydration issues and duplicate extension warning
    immediatelyRender: false,
  });

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={`border border-[#3d4457] rounded-md bg-[#292d39] ${className}`}>
      {editable && (
        <div className="flex items-center gap-1 p-2 border-b border-[#3d4457] flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-[#3d4457] text-white' : 'text-[#838a9c]'}`}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-[#3d4457] text-white' : 'text-[#838a9c]'}`}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('code') ? 'bg-[#3d4457] text-white' : 'text-[#838a9c]'}`}
          >
            <Code className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-[#3d4457] mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-[#3d4457] text-white' : 'text-[#838a9c]'}`}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-[#3d4457] text-white' : 'text-[#838a9c]'}`}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-[#3d4457] text-white' : 'text-[#838a9c]'}`}
          >
            <Quote className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-[#3d4457] mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-[#3d4457] text-white' : 'text-[#838a9c]'}`}
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-[#3d4457] mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="h-8 w-8 p-0 text-[#838a9c]"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="h-8 w-8 p-0 text-[#838a9c]"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      )}
      <EditorContent editor={editor} className="text-white" />
    </div>
  );
}
