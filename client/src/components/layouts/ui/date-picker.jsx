import React, { useState } from 'react';
import './DatePicker.css'; // Import your CSS for styling

const DatePicker = ({ selectedDate, onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(selectedDate || '');

  const toggleCalendar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setDate(newDate);
    onDateChange(newDate);
  };

  return (
    <div className="date-picker">
      <input
        type="text"
        value={date}
        onClick={toggleCalendar}
        readOnly
        placeholder="Select a date"
      />
      {isOpen && (
        <div className="calendar">
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
          />
          <button onClick={toggleCalendar}>Close</button>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
