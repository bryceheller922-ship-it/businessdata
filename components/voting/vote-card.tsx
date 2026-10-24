'use client'

import Image from 'next/image'
import { avatarUrl } from '@/lib/utils'

interface VoteCardProps {
  profile: {
    id: string
    instagram_handle?: string | null
    avatar_url?: string | null
    vote_points?: number
  }
  onVote: () => void
  question: string
  voting: boolean
}

export function VoteCard({ profile, onVote, question, voting }: VoteCardProps) {
  const handle = profile.instagram_handle || 'student'
  const src = avatarUrl(handle)
  const initials = handle.slice(0, 2).toUpperCase()

  return (
    <div className="group relative">
      <button
        onClick={onVote}
        disabled={voting}
        className="w-full aspect-video rounded-2xl border border-vouch-100 bg-white overflow-hidden shadow-vote transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-white font-bold text-lg shadow-md">{handle}</h3>
            <p className="text-white/90 text-xs">{profile.vote_points ?? 0} votes received</p>
          </div>
        </div>
        {src ? (
          <Image src={src} alt={handle} fill sizes="(max-width: 640px) 100vw, 640px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-vouch-100">
            <span className="text-vouch-600 font-bold text-xl">{initials}</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white bg-white/90 px-3 py-1.5 text-xs font-semibold shadow-lg">
            Vote
          </span>
        </div>
      </button>
    </div>
  )
}
