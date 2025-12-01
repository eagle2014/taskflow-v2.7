import { Search, Bell, SlidersHorizontal, Sparkles, Share2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface ActivityHeaderProps {
  createdDate?: Date | string;
  notificationCount?: number;
  onAskAI?: () => void;
  onShare?: () => void;
}

export function ActivityHeader({
  createdDate,
  notificationCount = 0,
  onAskAI,
  onShare,
}: ActivityHeaderProps) {
  const formatCreatedDate = (date: Date | string | undefined) => {
    if (!date) return null;
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM d yyyy');
    } catch {
      return null;
    }
  };

  const formattedDate = formatCreatedDate(createdDate);

  return (
    <div className="border-b border-[#3d4457]">
      {/* Top Row: Created Date and Actions */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-[#838a9c]">
        {formattedDate && (
          <span>Created {formattedDate}</span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {/* Ask AI Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAskAI}
            className="h-6 px-2 py-0 text-xs text-[#8b5cf6] hover:text-[#a78bfa] hover:bg-[#292d39] gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Ask AI
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="h-6 px-2 py-0 text-xs text-[#838a9c] hover:text-white hover:bg-[#292d39] gap-1"
          >
            <Share2 className="h-3 w-3" />
            Share
          </Button>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-[#292d39] text-[#838a9c] hover:text-white"
                aria-label="More options"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#292d39] border-[#3d4457]">
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">
                Print
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white focus:bg-[#3d4457] focus:text-white">
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Activity Title Row */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Activity</h3>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-[#292d39] text-[#838a9c] hover:text-white"
            aria-label="Search activity"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-[#292d39] text-[#838a9c] hover:text-white relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#8b5cf6] text-[10px] text-white flex items-center justify-center font-medium">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-[#292d39] text-[#838a9c] hover:text-white"
            aria-label="Filter"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
