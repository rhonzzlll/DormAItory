// Example in Button.js
import { cn } from "../../../lib/utils"; // Adjust according to your folder structure

const Button = ({ className, children, ...props }) => {
  return (
    <button className={cn("base-button-styles", className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
