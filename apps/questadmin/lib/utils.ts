import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeUndefinedFields<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields) as unknown as T
  } else if (obj && typeof obj === 'object') {
    return Object.entries(obj)
      .filter(([_, v]) => v !== undefined)
      .reduce((acc, [k, v]) => {
        acc[k] = (v && typeof v === 'object') ? removeUndefinedFields(v) : v
        return acc
      }, {} as any)
  }
  return obj
}