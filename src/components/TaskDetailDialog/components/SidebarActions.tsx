import { MessageSquare, Ban, Clock, Link2, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarActionsProps {
  activeTab: 'activity' | 'blocking' | 'waiting';
  onTabChange: (tab: 'activity' | 'blocking' | 'waiting') => void;
  onAddLink?: () => void;
  onAddMore?: () => void;
}

export function SidebarActions({
  activeTab,
  onTabChange,
  onAddLink,
  onAddMore,
}: SidebarActionsProps) {
  const actions = [
    {
      id: 'activity' as const,
      icon: MessageSquare,
      label: 'Activity',
      isTab: true,
    },
    {
      id: 'blocking' as const,
      icon: Ban,
      label: 'Blocking',
      isTab: true,
    },
    {
      id: 'waiting' as const,
      icon: Clock,
      label: 'Waiting on',
      isTab: true,
    },
    {
      id: 'link',
      icon: Link2,
      label: 'Add link',
      onClick: onAddLink,
    },
    {
      id: 'more',
      icon: Plus,
      label: 'More',
      onClick: onAddMore,
    },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col items-center py-2 px-1 border-l border-[#3d4457] bg-[#1a1d26]">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = action.isTab && activeTab === action.id;

          return (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-9 h-9 p-0 mb-1 ${
                    isActive
                      ? 'bg-[#8b5cf6] text-white hover:bg-[#7c4ee0]'
                      : 'text-[#838a9c] hover:text-white hover:bg-[#292d39]'
                  }`}
                  onClick={() => {
                    if (action.isTab) {
                      onTabChange(action.id as 'activity' | 'blocking' | 'waiting');
                    } else if (action.onClick) {
                      action.onClick();
                    }
                  }}
                  aria-label={action.label}
                  aria-pressed={isActive}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-[#292d39] border-[#3d4457] text-white">
                {action.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Divider */}
        <div className="w-5 h-px bg-[#3d4457] my-2" />

        {/* More options */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-9 h-9 p-0 text-[#838a9c] hover:text-white hover:bg-[#292d39]"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-[#292d39] border-[#3d4457] text-white">
            More
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
