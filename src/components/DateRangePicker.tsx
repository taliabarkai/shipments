import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import svgPaths from '../imports/svg-8i0hxkhc97';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  filterCount?: number;
}

export function DateRangePicker({ startDate, endDate, onDateRangeChange, filterCount }: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const formatDateRange = () => {
    if (!startDate && !endDate) return '';
    if (startDate && !endDate) return formatDisplayDate(startDate);
    if (!startDate && endDate) return formatDisplayDate(endDate);
    return `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`;
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMonthData = (baseMonth: Date) => {
    const year = baseMonth.getFullYear();
    const month = baseMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    return {
      year,
      month,
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      startingDayOfWeek,
      daysInMonth,
    };
  };

  const currentMonthData = getMonthData(currentMonth);
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const nextMonthData = getMonthData(nextMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (year: number, month: number, day: number) => {
    const clickedDate = formatDateToString(new Date(year, month, day));
    
    if (!startDate || (startDate && endDate)) {
      // Start new range
      onDateRangeChange(clickedDate, '');
    } else {
      // Complete the range
      if (clickedDate < startDate) {
        onDateRangeChange(clickedDate, startDate);
      } else {
        onDateRangeChange(startDate, clickedDate);
      }
    }
  };

  const isDateInRange = (year: number, month: number, day: number) => {
    if (!startDate) return false;
    const dateStr = formatDateToString(new Date(year, month, day));
    if (!endDate) {
      return dateStr === startDate;
    }
    return dateStr >= startDate && dateStr <= endDate;
  };

  const isDateStart = (year: number, month: number, day: number) => {
    if (!startDate) return false;
    const dateStr = formatDateToString(new Date(year, month, day));
    return dateStr === startDate;
  };

  const isDateEnd = (year: number, month: number, day: number) => {
    if (!endDate) return false;
    const dateStr = formatDateToString(new Date(year, month, day));
    return dateStr === endDate;
  };

  const handleShortcut = (shortcut: string) => {
    const today = new Date();
    let start: Date;
    let end: Date;

    switch (shortcut) {
      case 'This Week':
        const dayOfWeek = today.getDay();
        start = new Date(today);
        start.setDate(today.getDate() - dayOfWeek);
        end = new Date(today);
        end.setDate(today.getDate() + (6 - dayOfWeek));
        break;
      case 'Last Week':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        start = lastWeekStart;
        end = lastWeekEnd;
        break;
      case 'Last 7 Days':
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        end = today;
        break;
      case 'Current Month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'Next Month':
        start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        break;
      case 'Reset':
        onDateRangeChange('', '');
        return;
      default:
        return;
    }

    onDateRangeChange(formatDateToString(start), formatDateToString(end));
  };

  const renderCalendar = (monthData: ReturnType<typeof getMonthData>) => {
    const weeks = [];
    let days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < monthData.startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= monthData.daysInMonth; day++) {
      const inRange = isDateInRange(monthData.year, monthData.month, day);
      const isStart = isDateStart(monthData.year, monthData.month, day);
      const isEnd = isDateEnd(monthData.year, monthData.month, day);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(monthData.year, monthData.month, day)}
          className={`w-10 h-10 flex items-center justify-center text-sm rounded-full transition-colors
            ${inRange ? 'bg-[#42a5f5] text-white' : 'text-gray-700 hover:bg-gray-100'}
            ${(isStart || isEnd) ? 'bg-[#42a5f5] text-white' : ''}
          `}
        >
          {day}
        </button>
      );

      // Create a new week row when we reach Sunday (index 6) or the last day
      if ((monthData.startingDayOfWeek + day) % 7 === 0 || day === monthData.daysInMonth) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-1">
            {days}
          </div>
        );
        days = [];
      }
    }

    return weeks;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-500">
          <svg className="w-4 h-4 opacity-70" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path d={svgPaths.p1ef8e700} fill="currentColor" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-lg" align="start">
        <div className="flex">
          {/* Shortcuts Sidebar */}
          <div className="p-4 space-y-2 border-r border-gray-200 bg-gray-50">
            {['This Week', 'Last Week', 'Last 7 Days', 'Current Month', 'Next Month', 'Reset'].map((shortcut) => (
              <button
                key={shortcut}
                onClick={() => handleShortcut(shortcut)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                {shortcut}
              </button>
            ))}
          </div>

          {/* Calendar Section */}
          <div className="p-6 bg-white">
            {/* Header */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Select Date Range
              </div>
              <div className="text-xl text-gray-900">
                {formatDateRange() || 'Select dates'}
              </div>
            </div>

            {/* Month Navigation and Calendars */}
            <div>
              {/* Single Month */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-sm text-gray-900 font-medium">
                    {currentMonthData.monthName}
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="w-10 h-8 flex items-center justify-center text-xs text-gray-500 font-medium">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="space-y-1">
                  {renderCalendar(currentMonthData)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}