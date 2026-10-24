'use client'

import { Lock, LockKeyhole } from 'lucide-react'

export function LockIcon({ className }: { className?: string }) {
  return (
    <Lock className={className} strokeWidth={2} />
  )
}

export function LockedLabel({ locked }: { locked: boolean }) {
  if (!locked) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-vouch-200 bg-vouch-50 px-2.5 py-0.5 text-[10px] font-semibold text-vouch-600">
      <LockKeyhole size={10} strokeWidth={2} />
      Locked
    </span>
  )
}
