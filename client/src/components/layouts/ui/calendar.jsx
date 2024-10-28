// components/ui/calendar.jsx
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

export const Calendar = ({ selectedDate, onDateSelect, className = "" }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day names
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate padding days for the first week
  const firstDayOfMonth = monthStart.getDay();
  const paddingDays = Array(firstDayOfMonth).fill(null);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  };

  const handleDateClick = (date) => {
    if (onDateSelect && isSameMonth(date, currentMonth)) {
      onDateSelect(date);
    }
  };

  return (
    <div className={`w-full max-w-sm bg-white border rounded-lg shadow ${className}`}>
      {/* Calendar Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding days */}
          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="h-10" />
          ))}

          {/* Actual days */}
          {daysInMonth.map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentMonth = isSameMonth(date, currentMonth);

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  h-10 w-full rounded-lg flex items-center justify-center text-sm
                  ${!isCurrentMonth && 'text-gray-300'}
                  ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
                  ${!isSelected && isCurrentMonth ? 'text-gray-700' : ''}
                `}
                disabled={!isCurrentMonth}
              >
                {format(date, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Example usage in VisitorManagement.jsx:

const Example = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div>
      <Calendar
        selectedDate={selectedDate}
        onDateSelect={(date) => {
          setSelectedDate(date);
          console.log('Selected date:', format(date, 'yyyy-MM-dd'));
        }}
      />
    </div>
  );
};

export default Example;