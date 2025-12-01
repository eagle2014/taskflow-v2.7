import { useState } from 'react';
import { format, addDays, addWeeks, nextSaturday, isToday, isTomorrow, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ClickUpDatePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

// Quick date options like ClickUp
const getQuickOptions = () => {
  const today = startOfDay(new Date());
  return [
    { label: 'Today', date: today, shortLabel: format(today, 'EEE') },
    { label: 'Later', date: addDays(today, 0), shortLabel: format(today, 'h:mm a'), isTime: true },
    { label: 'Tomorrow', date: addDays(today, 1), shortLabel: format(addDays(today, 1), 'EEE') },
    { label: 'Next week', date: addWeeks(today, 1), shortLabel: format(addWeeks(today, 1), 'EEE') },
    { label: 'Next weekend', date: nextSaturday(today), shortLabel: format(nextSaturday(today), 'EEE') },
    { label: '2 weeks', date: addWeeks(today, 2), shortLabel: format(addWeeks(today, 2), 'd MMM') },
    { label: '4 weeks', date: addWeeks(today, 4), shortLabel: format(addWeeks(today, 4), 'd MMM') },
    { label: '8 weeks', date: addWeeks(today, 8), shortLabel: format(addWeeks(today, 8), 'd MMM') },
  ];
};

// Format date for display - show relative text if applicable
const formatDateDisplay = (date: Date | undefined): string => {
  if (!date) return '';

  const today = startOfDay(new Date());
  const dateStart = startOfDay(date);

  if (isToday(dateStart)) return 'Today';
  if (isTomorrow(dateStart)) return 'Tomorrow';

  // Check if it's within 7 days - show day name
  const diffDays = Math.floor((dateStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 0 && diffDays <= 7) {
    return format(date, 'EEEE'); // Full day name
  }

  return format(date, 'M/d/yy');
};

export function ClickUpDatePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ClickUpDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<'start' | 'end'>('start');

  const quickOptions = getQuickOptions();

  // Reset activeField to 'start' when popover opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // When opening, start with 'start' field if no start date, else 'end'
      setActiveField(startDate ? 'end' : 'start');
    }
  };

  const handleQuickSelect = (date: Date) => {
    if (activeField === 'start') {
      onStartDateChange(date);
      // Always switch to end date field after selecting start
      setActiveField('end');
    } else {
      onEndDateChange(date);
      // End date selected, close popover
      setIsOpen(false);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (activeField === 'start') {
      onStartDateChange(date);
      // Always switch to end date field after selecting start
      setActiveField('end');
    } else {
      onEndDateChange(date);
      // End date selected, close popover
      setIsOpen(false);
    }
  };

  const clearDate = (field: 'start' | 'end', e: React.MouseEvent) => {
    e.stopPropagation();
    if (field === 'start') {
      onStartDateChange(undefined);
    } else {
      onEndDateChange(undefined);
    }
  };

  const hasStartDate = !!startDate;
  const hasEndDate = !!endDate;
  const isEmpty = !hasStartDate && !hasEndDate;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-[#292d39] px-2 py-1 rounded transition-colors text-sm">
          {isEmpty ? (
            <span className="text-[#838a9c]">Empty</span>
          ) : (
            <div className="flex items-center gap-1">
              {hasStartDate && (
                <span className="flex items-center gap-1 text-white">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#838a9c]" />
                  {formatDateDisplay(startDate)}
                </span>
              )}
              {hasStartDate && hasEndDate && (
                <span className="text-[#838a9c] mx-1">→</span>
              )}
              {hasEndDate && (
                <span className="flex items-center gap-1 text-white">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#838a9c]" />
                  {formatDateDisplay(endDate)}
                </span>
              )}
            </div>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 bg-[#1f2330] border-[#3d4457]"
        align="start"
        sideOffset={5}
      >
        <div className="flex">
          {/* Left side - Quick options */}
          <div className="w-44 border-r border-[#3d4457] py-2">
            {quickOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handleQuickSelect(option.date)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#c5c9d6] hover:bg-[#292d39] hover:text-white transition-colors"
              >
                <span>{option.label}</span>
                <span className="text-[#838a9c] text-xs">{option.shortLabel}</span>
              </button>
            ))}

            <div className="border-t border-[#3d4457] mt-2 pt-2">
              <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#c5c9d6] hover:bg-[#292d39] hover:text-white transition-colors">
                <span>Set Recurring</span>
                <span className="text-[#838a9c]">›</span>
              </button>
            </div>
          </div>

          {/* Right side - Date pickers */}
          <div className="p-4">
            {/* Start/End date tabs */}
            <div className="flex gap-4 mb-4">
              {/* Start Date Field */}
              <div
                onClick={() => setActiveField('start')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer transition-colors ${
                  activeField === 'start'
                    ? 'border-[#8b5cf6] bg-[#8b5cf6]/10'
                    : 'border-[#3d4457] hover:border-[#4d5467]'
                }`}
              >
                <CalendarIcon className="w-4 h-4 text-[#838a9c]" />
                <span className={`text-sm ${startDate ? 'text-white' : 'text-[#838a9c]'}`}>
                  {startDate ? format(startDate, 'M/d/yy') : 'Start date'}
                </span>
                {startDate && (
                  <button
                    onClick={(e) => clearDate('start', e)}
                    className="ml-1 text-[#838a9c] hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* End Date Field */}
              <div
                onClick={() => setActiveField('end')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer transition-colors ${
                  activeField === 'end'
                    ? 'border-[#8b5cf6] bg-[#8b5cf6]/10'
                    : 'border-[#3d4457] hover:border-[#4d5467]'
                }`}
              >
                <CalendarIcon className="w-4 h-4 text-[#838a9c]" />
                <span className={`text-sm ${endDate ? 'text-white' : 'text-[#838a9c]'}`}>
                  {endDate ? format(endDate, 'M/d/yy') : 'End date'}
                </span>
                {endDate && (
                  <button
                    onClick={(e) => clearDate('end', e)}
                    className="ml-1 text-[#838a9c] hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Add time link */}
              <button className="text-sm text-[#838a9c] hover:text-white">
                Add time
              </button>
            </div>

            {/* Calendar */}
            <Calendar
              mode="single"
              selected={activeField === 'start' ? startDate : endDate}
              onSelect={handleCalendarSelect}
              className="rounded-md border border-[#3d4457] bg-[#1f2330]"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-white",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-[#838a9c] rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#8b5cf6]/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal text-[#c5c9d6] hover:bg-[#3d4457] rounded-md aria-selected:opacity-100",
                day_selected: "bg-[#8b5cf6] text-white hover:bg-[#8b5cf6] hover:text-white focus:bg-[#8b5cf6] focus:text-white",
                day_today: "bg-[#3d4457] text-white",
                day_outside: "text-[#4d5467] opacity-50",
                day_disabled: "text-[#4d5467] opacity-50",
                day_range_middle: "aria-selected:bg-[#8b5cf6]/20 aria-selected:text-white",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}