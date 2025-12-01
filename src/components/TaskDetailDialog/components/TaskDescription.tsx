import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Button } from '../../ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import '../editor.css';

// Create extensions ONCE outside component to prevent duplicate warning
// Note: We disable link in StarterKit and add our own Link extension with custom config
const createExtensions = () => [
  StarterKit.configure({
    // StarterKit doesn't include Link by default, but let's be explicit
  }),
  Placeholder.configure({
    placeholder: 'Add a description...',
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-600 underline hover:text-blue-800',
    },
  }).extend({
    // Ensure unique extension name to prevent duplicates
    name: 'customLink',
  }),
];

interface TaskDescriptionProps {
  description?: string;
  onChange: (description: string) => void;
  onAIAssist?: () => void;
}

export function TaskDescription({
  description = '',
  onChange,
  onAIAssist
}: TaskDescriptionProps) {
  // Use ref to ensure extensions are created only once per component instance
  const extensionsRef = useRef(createExtensions());

  const editor = useEditor({
    extensions: extensionsRef.current,
    content: description,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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

  // Update editor content when description prop changes
  useEffect(() => {
    if (editor && description !== editor.getHTML()) {
      editor.commands.setContent(description);
    }
  }, [description, editor]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-[#3d4457] rounded-lg overflow-hidden bg-[#292d39]">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[#3d4457] bg-[#1f2330]">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBold}
            className={`h-8 w-8 p-0 text-[#838a9c] hover:text-white hover:bg-[#3d4457] ${editor.isActive('bold') ? 'bg-[#3d4457] text-white' : ''}`}
            aria-label="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleItalic}
            className={`h-8 w-8 p-0 text-[#838a9c] hover:text-white hover:bg-[#3d4457] ${editor.isActive('italic') ? 'bg-[#3d4457] text-white' : ''}`}
            aria-label="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-[#3d4457] mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBulletList}
            className={`h-8 w-8 p-0 text-[#838a9c] hover:text-white hover:bg-[#3d4457] ${editor.isActive('bulletList') ? 'bg-[#3d4457] text-white' : ''}`}
            aria-label="Bullet list"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleOrderedList}
            className={`h-8 w-8 p-0 text-[#838a9c] hover:text-white hover:bg-[#3d4457] ${editor.isActive('orderedList') ? 'bg-[#3d4457] text-white' : ''}`}
            aria-label="Numbered list"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-[#3d4457] mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={`h-8 w-8 p-0 text-[#838a9c] hover:text-white hover:bg-[#3d4457] ${editor.isActive('link') ? 'bg-[#3d4457] text-white' : ''}`}
            aria-label="Insert link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>

        {onAIAssist && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAIAssist}
            className="gap-2 border-[#3d4457] bg-transparent text-[#838a9c] hover:bg-[#3d4457] hover:text-white"
            aria-label="Write with AI"
          >
            <Sparkles className="w-4 h-4" />
            Write with AI
          </Button>
        )}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="text-white [&_.ProseMirror]:text-[#c5c9d6] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#838a9c]" />
    </div>
  );
}
