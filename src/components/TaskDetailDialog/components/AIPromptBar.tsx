import { Sparkles } from 'lucide-react';

interface AIPromptBarProps {
  onSubmit: (prompt: string) => Promise<void>;
  onClose: () => void;
}

export function AIPromptBar(_props: AIPromptBarProps) {
  // Simplified to just display the AI prompt suggestion bar
  // Full AI interaction will be implemented in Phase 5

  return (
    <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg px-4 py-3 mb-6">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="w-4 h-4 text-[#8b5cf6]" aria-hidden="true" />
        <span className="text-[#8b5cf6] font-medium">Ask Brain</span>
        <span className="text-[#838a9c]">
          to write a description, create a summary or find similar tasks
        </span>
      </div>
    </div>
  );
}
