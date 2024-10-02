// src/lib/utils.js

import { clsx } from "clsx"; // Import clsx for conditional class names
import { twMerge } from "tailwind-merge"; // Import tailwind-merge for merging Tailwind CSS classes

// Function to combine class names
export function cn(...inputs) {
  return twMerge(clsx(inputs)); // Use clsx to combine and tailwind-merge to handle duplicates
}
