import { useState, useRef, useEffect } from 'react';
import {
  Smile,
  Paperclip,
  AtSign,
  BarChart3,
  Link2,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentInputProps {
  onSubmit?: (content: string) => void;
  placeholder?: string;
}

export function CommentInput({
  onSubmit,
  placeholder = 'Mention @Brain to create, find, ask anything...',
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 5000;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (content.trim() && onSubmit) {
      onSubmit(content.trim());
      setContent('');
      setCharCount(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxChars) {
      setContent(newContent);
      setCharCount(newContent.length);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Comment Input Area */}
      <div className="p-4">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[60px] max-h-[200px] resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
          aria-label="Comment input"
        />

        {/* Character Counter */}
        {charCount > 0 && (
          <div className="mt-1 text-xs text-right text-gray-400">
            {charCount}/{maxChars}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 pb-4 gap-2">
        <div className="flex items-center gap-1">
          {/* Comment Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium border-gray-300"
              >
                Comment
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem>Comment</DropdownMenuItem>
              <DropdownMenuItem>Description</DropdownMenuItem>
              <DropdownMenuItem>Action item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Toolbar Icons */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Add emoji"
          >
            <Smile className="h-4 w-4 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Mention someone"
          >
            <AtSign className="h-4 w-4 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Add chart"
          >
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Add link"
          >
            <Link2 className="h-4 w-4 text-gray-600" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem>Insert code block</DropdownMenuItem>
              <DropdownMenuItem>Insert table</DropdownMenuItem>
              <DropdownMenuItem>Insert task list</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Submit hint */}
        {content.trim() && (
          <div className="text-xs text-gray-400">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to send
          </div>
        )}
      </div>
    </div>
  );
}
