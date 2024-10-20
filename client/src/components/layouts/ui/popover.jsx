import React, { useState, useRef } from 'react';
import './Popover.css'; // Import your CSS for styling

const Popover = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const togglePopover = () => {
    setIsOpen((prev) => !prev);
  };

  const closePopover = (e) => {
    // Close the popover if clicked outside
    if (popoverRef.current && !popoverRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  // Use the effect to add/remove the event listener for clicking outside
  React.useEffect(() => {
    document.addEventListener('mousedown', closePopover);
    return () => {
      document.removeEventListener('mousedown', closePopover);
    };
  }, []);

  return (
    <div className="popover-container" ref={popoverRef}>
      {React.Children.map(children, child => {
        if (child.type === PopoverTrigger) {
          return React.cloneElement(child, { onClick: togglePopover });
        }
        if (child.type === PopoverContent && isOpen) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

const PopoverTrigger = ({ children, onClick }) => (
  <div onClick={onClick} className="popover-trigger">
    {children}
  </div>
);

const PopoverContent = ({ children }) => (
  <div className="popover-content">
    {children}
  </div>
);

export { Popover as default, PopoverTrigger, PopoverContent };