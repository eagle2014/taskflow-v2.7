import { StatusPillProps } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const STATUS_CONFIG = {
  'completed': { label: 'COMPLETE', bg: 'bg-emerald-500/20', text: 'text-emerald-400', hover: 'hover:bg-emerald-500/30', border: 'border-emerald-500/30' },
  'done': { label: 'COMPLETE', bg: 'bg-emerald-500/20', text: 'text-emerald-400', hover: 'hover:bg-emerald-500/30', border: 'border-emerald-500/30' },
  'in-progress': { label: 'IN PROGRESS', bg: 'bg-yellow-500/20', text: 'text-yellow-400', hover: 'hover:bg-yellow-500/30', border: 'border-yellow-500/30' },
  'in-review': { label: 'IN REVIEW', bg: 'bg-[#8b5cf6]/20', text: 'text-[#8b5cf6]', hover: 'hover:bg-[#8b5cf6]/30', border: 'border-[#8b5cf6]/30' },
  'ready': { label: 'READY', bg: 'bg-blue-500/20', text: 'text-blue-400', hover: 'hover:bg-blue-500/30', border: 'border-blue-500/30' },
  'todo': { label: 'TO DO', bg: 'bg-gray-500/20', text: 'text-gray-400', hover: 'hover:bg-gray-500/30', border: 'border-gray-500/30' },
  'new': { label: 'NEW', bg: 'bg-gray-500/20', text: 'text-gray-400', hover: 'hover:bg-gray-500/30', border: 'border-gray-500/30' },
} as const;

export function StatusPill({ status, onChange }: StatusPillProps) {
  const config = STATUS_CONFIG[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center gap-2 px-3 py-1 rounded border text-xs font-medium transition-colors ${config.bg} ${config.text} ${config.border} ${config.hover}`}
        >
          {config.label}
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-[#292d39] border-[#3d4457]">
        {Object.entries(STATUS_CONFIG).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onChange(key as any)}
            className="cursor-pointer text-white hover:bg-[#1f2330]"
          >
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${value.bg}`} />
            {value.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
