import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { CreateEventDialog } from './CreateEventDialog';

interface Event {
  id: string;
  name: string;
  assignedTo: { name: string; avatar?: string };
  startDateTime: string;
  endDateTime: string;
  activityType: string;
  recurringEvent?: string;
  relatedTo?: string;
  agenda?: string;
  meetingNotes?: string;
}

interface EventsTabProps {
  projectId: string;
}

// Mock data for demonstration
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'test',
    assignedTo: { name: 'tr nguyen' },
    startDateTime: '2025-12-03 12:00 AM',
    endDateTime: '2025-12-03 12:30 AM',
    activityType: 'Call',
    relatedTo: 'trungnt-test',
  },
];

export function EventsTab({ projectId }: EventsTabProps) {
  const [events] = useState<Event[]>(mockEvents);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentPage] = useState(1);
  const [totalPages] = useState(1);

  const toggleSelectAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(events.map(e => e.id)));
    }
  };

  const toggleSelectEvent = (id: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEvents(newSelected);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-full flex flex-col bg-[#1f2330]">
      {/* Header with Add Event button and pagination */}
      <div className="flex items-center justify-end gap-4 p-4 border-b border-[#3d4457]">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>

        {/* Pagination */}
        <div className="flex items-center gap-2 text-sm text-[#838a9c]">
          <button
            className="p-1 hover:bg-[#3d4457] rounded disabled:opacity-50 text-[#838a9c]"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>{currentPage} to {totalPages}</span>
          <button
            className="p-1 hover:bg-[#3d4457] rounded disabled:opacity-50 text-[#838a9c]"
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-[#292d39] sticky top-0">
            <tr className="text-left text-xs font-medium text-[#838a9c] uppercase tracking-wider">
              <th className="p-3 w-10">
                <Checkbox
                  checked={selectedEvents.size === events.length && events.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="p-3">Name</th>
              <th className="p-3">Assigned To</th>
              <th className="p-3">Start Date & Time</th>
              <th className="p-3">End Date & Time</th>
              <th className="p-3">Activity Type</th>
              <th className="p-3">Recurring Event</th>
              <th className="p-3">Related To</th>
              <th className="p-3">Agenda</th>
              <th className="p-3">Meeting Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3d4457]">
            {events.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-[#838a9c] mx-auto mb-4" />
                  <p className="text-[#838a9c] text-lg">No events scheduled yet</p>
                  <p className="text-[#666] text-sm mt-2">Create your first project event</p>
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-[#292d39]">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedEvents.has(event.id)}
                      onCheckedChange={() => toggleSelectEvent(event.id)}
                    />
                  </td>
                  <td className="p-3 text-sm text-white">{event.name}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center text-xs font-medium">
                        {getInitials(event.assignedTo.name)}
                      </div>
                      <span className="text-sm text-white">{event.assignedTo.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-[#838a9c]">{event.startDateTime}</td>
                  <td className="p-3 text-sm text-[#838a9c]">{event.endDateTime}</td>
                  <td className="p-3 text-sm text-white">{event.activityType}</td>
                  <td className="p-3 text-sm text-[#838a9c]">{event.recurringEvent || '-'}</td>
                  <td className="p-3 text-sm text-white">{event.relatedTo || '-'}</td>
                  <td className="p-3 text-sm text-[#838a9c]">{event.agenda || '-'}</td>
                  <td className="p-3 text-sm text-[#838a9c]">{event.meetingNotes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Event Dialog */}
      {showCreateDialog && (
        <CreateEventDialog
          projectId={projectId}
          onClose={() => setShowCreateDialog(false)}
          onCreated={(event) => {
            // TODO: Add event to list
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}
