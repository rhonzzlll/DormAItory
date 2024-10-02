 // src/components/layouts/ui/Switch.js
import React from 'react';
import { cn } from "../../../lib/utils"; // Adjust according to your folder structure

const Switch = ({ checked, onChange, ...props }) => {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} {...props} />
      <span className="slider round"></span>
    </label>
  );
};

export default Switch;
