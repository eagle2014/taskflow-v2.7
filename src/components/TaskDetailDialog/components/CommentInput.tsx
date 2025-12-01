import { useState, useRef, useEffect } from 'react';
import {
  Smile,
  Paperclip,
  AtSign,
  MoreHorizontal,
  ChevronDown,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

export interface ReplyContext {
  commentId: string;
  userName: string;
  content: string;
  userInitials?: string;
  userColor?: string;
  timestamp?: Date;
}

interface CommentInputProps {
  onSubmit?: (content: string, parentCommentId?: string) => void;
  placeholder?: string;
  replyTo?: ReplyContext | null;
  onCancelReply?: () => void;
}

export function CommentInput({
  onSubmit,
  placeholder = 'Mention @Brain to create, find, ask anything...',
  replyTo,
  onCancelReply,
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

  // Focus textarea when replying
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = () => {
    if (content.trim() && onSubmit) {
      onSubmit(content.trim(), replyTo?.commentId);
      setContent('');
      setCharCount(0);
      onCancelReply?.();
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

  // Truncate long content for display
  const truncateContent = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Format timestamp for display
  const formatTimestamp = (date: Date | undefined) => {
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false });
    } catch {
      return '';
    }
  };

  return (
    <div className="border-t border-[#3d4457] bg-[#1f2330]">
      {/* Reply Quote Box - ClickUp/Zalo style */}
      {replyTo && (
        <div className="mx-4 mt-3 p-3 bg-[#292d39] border-l-2 border-[#8b5cf6] rounded-r-md">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Avatar
              className="w-8 h-8 flex-shrink-0"
              style={{ backgroundColor: replyTo.userColor || '#0ea5e9' }}
            >
              <AvatarFallback className="text-xs text-white font-medium">
                {replyTo.userInitials || replyTo.userName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header: Name + Time */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">
                  {replyTo.userName}
                </span>
                {replyTo.timestamp && (
                  <span className="text-xs text-[#838a9c]">
                    {formatTimestamp(replyTo.timestamp)}
                  </span>
                )}
              </div>
              {/* Message content */}
              <p className="text-sm text-[#c5c9d6]">
                {truncateContent(replyTo.content, 150)}
              </p>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="h-6 w-6 p-0 hover:bg-[#3d4457] text-[#838a9c] hover:text-white flex-shrink-0"
              aria-label="Cancel reply"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Comment Input Area */}
      <div className="p-4">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[60px] max-h-[200px] resize-none bg-[#292d39] border-[#3d4457] text-[#c5c9d6] placeholder:text-[#838a9c] focus:border-[#8b5cf6] focus:ring-[#8b5cf6] text-sm"
          aria-label="Comment input"
        />

        {/* Character Counter */}
        {charCount > 0 && (
          <div className="mt-1 text-xs text-right text-[#838a9c]">
            {charCount}/{maxChars}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 pb-4 gap-2">
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
          {/* Plus button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-[#3d4457] text-[#838a9c] hover:text-white flex-shrink-0"
            aria-label="Add"
          >
            <span className="text-lg font-light">+</span>
          </Button>

          {/* Comment Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium border-[#3d4457] bg-transparent text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white flex-shrink-0"
              >
                Comment
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 bg-[#292d39] border-[#3d4457]">
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">Comment</DropdownMenuItem>
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">Description</DropdownMenuItem>
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">Action item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* AI / Sparkles */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-[#3d4457] text-[#8b5cf6] hover:text-[#a78bfa] flex-shrink-0"
            aria-label="AI Assist"
          >
            <Sparkles className="h-4 w-4" />
          </Button>

          {/* Toolbar Icons */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-[#3d4457] text-[#838a9c] hover:text-white flex-shrink-0"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-[#3d4457] text-[#838a9c] hover:text-white flex-shrink-0"
            aria-label="Mention someone"
          >
            <AtSign className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-[#3d4457] text-[#838a9c] hover:text-white flex-shrink-0"
            aria-label="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-[#3d4457] text-[#838a9c] hover:text-white flex-shrink-0"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-[#292d39] border-[#3d4457]">
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">Add link</DropdownMenuItem>
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">Add chart</DropdownMenuItem>
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">Browse files</DropdownMenuItem>
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">Insert code block</DropdownMenuItem>
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">Insert table</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Send Button - Always visible */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim()}
          className={`h-8 w-8 p-0 flex-shrink-0 ${
            content.trim()
              ? 'text-[#8b5cf6] hover:text-[#a78bfa] hover:bg-[#3d4457]'
              : 'text-[#838a9c] cursor-not-allowed'
          }`}
          aria-label="Send comment"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
