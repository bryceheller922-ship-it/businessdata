import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(iso: string | null) {
  if (!iso) return 'just now'
  const d = new Date(iso)
  const now = new Date()
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function avatarUrl(handle?: string | null, size = 200) {
  if (!handle) return null
  // DiceBear avatars — deterministic, no API key, great for anonymous personas
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(handle)}&size=${size}`
}
