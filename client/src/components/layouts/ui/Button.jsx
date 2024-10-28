import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "../../../lib/utils"; // Adjust according to your folder structure

const Button = ({ className, children, variant, size, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantStyles = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizeStyles = {
    small: "px-2 py-1 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

Button.defaultProps = {
  className: '',
  variant: 'primary',
  size: 'medium',
};

export default Button;