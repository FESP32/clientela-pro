import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBool(fd: FormData, name: string) {
  const v = fd.get(name);
  return v === "true" || v === "on" || v === "1";
}

export function isExpired(expires_at?: string | null) {
  return !!expires_at && new Date(expires_at) <= new Date();
}

export function fmt(d?: string | null) {
  if (!d) return "—";
  try {
    return format(new Date(d), "PPP");
  } catch {
    return "—";
  }
}

