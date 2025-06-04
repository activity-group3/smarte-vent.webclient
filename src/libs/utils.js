import { clsx } from "clsx"
import { twMerge } from "tailwind-variants"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
