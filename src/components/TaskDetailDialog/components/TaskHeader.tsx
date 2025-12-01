import { TaskHeaderProps } from '../types';
import { Badge } from '../../ui/badge';
import { ChevronRight, X } from 'lucide-react';
import { useRef, useCallback } from 'react';

export function TaskHeader({ task, onTitleChange, onClose, onDragStart }: TaskHeaderProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const originalTitleRef = useRef(task.name);

  // Sanitize HTML to prevent XSS
  const sanitizeInput = useCallback((text: string): string => {
    return text
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .replace(/[<>]/g, '')     // Remove angle brackets
      .trim()
      .substring(0, 200);       // Limit length
  }, []);

  const handleTitleBlur = useCallback(() => {
    const newTitle = sanitizeInput(titleRef.current?.textContent || '');
    if (newTitle !== task.name && newTitle.length > 0) {
      onTitleChange(newTitle);
      originalTitleRef.current = newTitle;
    } else if (titleRef.current) {
      // Revert if empty
      titleRef.current.textContent = originalTitleRef.current;
    }
  }, [task.name, onTitleChange, sanitizeInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      titleRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Revert changes on Escape
      if (titleRef.current) {
        titleRef.current.textContent = originalTitleRef.current;
        titleRef.current.blur();
      }
    }
  }, []);

  // Prevent paste of HTML content
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const sanitized = sanitizeInput(text);
    document.execCommand('insertText', false, sanitized);
  }, [sanitizeInput]);

  // Extract breadcrumb info from task
  const spaceName = 'Space'; // Placeholder - would come from context
  const projectName = task.phase || 'Project';
  const phaseName = task.phase || 'Phase 1';

  return (
    <header
      className="border-b border-[#3d4457] px-6 py-4 bg-[#1f2330]"
    >
      {/* Breadcrumb - also serves as drag handle */}
      <nav
        className="flex items-center gap-2 text-sm text-[#838a9c] mb-3 cursor-move select-none"
        aria-label="Task breadcrumb navigation"
        onMouseDown={onDragStart}
      >
        <button
          className="text-[#8b5cf6] hover:text-[#7c66d9] cursor-pointer transition-colors"
          aria-label={`Navigate to ${spaceName}`}
        >
          {spaceName}
        </button>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <button
          className="hover:text-white cursor-pointer transition-colors"
          aria-label={`Navigate to ${projectName}`}
        >
          {projectName}
        </button>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <span className="text-white font-medium" aria-current="location">
          {phaseName}
        </span>
      </nav>

      {/* Task Title Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Badge
            variant="outline"
            className="text-xs font-mono bg-[#292d39] border-[#3d4457] text-[#838a9c] flex-shrink-0"
            aria-label={`Task ID: ${task.id.substring(0, 6)}`}
          >
            {task.id.substring(0, 6)}
          </Badge>
          <h1
            ref={titleRef}
            className="text-2xl font-semibold text-white outline-none flex-1 min-w-0 hover:bg-[#292d39] px-2 py-1 -ml-2 rounded transition-colors focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 focus:ring-offset-[#1f2330]"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            role="textbox"
            aria-label="Edit task title. Press Enter to save, Escape to cancel"
            aria-multiline="false"
          >
            {task.name}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 text-[#838a9c] hover:text-white hover:bg-[#292d39] rounded transition-colors"
            aria-label="Close task details dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
