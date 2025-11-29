import { Search, Bell, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ActivityHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900">Activity</h3>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-gray-100"
          aria-label="Search activity"
        >
          <Search className="h-4 w-4 text-gray-500" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-gray-500" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-100"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Clear all activity</DropdownMenuItem>
            <DropdownMenuItem>Export activity</DropdownMenuItem>
            <DropdownMenuItem>Activity settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
