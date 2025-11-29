import { DateRangeProps } from '../types';
import { format } from 'date-fns';

export function DateRange({ startDate, endDate }: DateRangeProps) {
  const hasStartDate = startDate && startDate !== '';
  const hasEndDate = endDate && endDate !== '';

  if (!hasStartDate && !hasEndDate) {
    return (
      <span className="text-sm text-[#838a9c]">Empty</span>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'M/d/yy');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white">
        {hasStartDate && formatDate(startDate)}
        {hasStartDate && hasEndDate && <span className="text-[#838a9c] mx-1">→</span>}
        {hasEndDate && formatDate(endDate)}
      </span>
    </div>
  );
}
