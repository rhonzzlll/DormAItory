// src/components/layouts/ui/alert-dialog.jsx

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "../../../lib/utils";

// Root Alert Dialog component
const AlertDialog = AlertDialogPrimitive.Root;

// Trigger to open the dialog
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

// Content of the alert dialog
const AlertDialogContent = AlertDialogPrimitive.Content;

// Title of the alert dialog
const AlertDialogTitle = AlertDialogPrimitive.Title;

// Description of the alert dialog
const AlertDialogDescription = AlertDialogPrimitive.Description;

// Actions in the alert dialog
const AlertDialogAction = AlertDialogPrimitive.Action;

// Cancel button for the alert dialog
const AlertDialogCancel = AlertDialogPrimitive.Cancel;

// Custom Header component for the Alert Dialog
const AlertDialogHeader = ({ children }) => (
  <div className="alert-dialog-header">
    {children}
  </div>
);

// Custom Footer component for the Alert Dialog
const AlertDialogFooter = ({ children }) => (
  <div className="alert-dialog-footer">
    {children}
  </div>
);

// Export all necessary components
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
};
