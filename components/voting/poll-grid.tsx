'use client'

import { VoteCard } from './vote-card'

interface PollGridProps {
  question: string
  category?: string | null
  nominees: {
    id: string
    instagram_handle?: string | null
    avatar_url?: string | null
    vote_points?: number
  }[]
  onVote: (nomineeId: string) => void
  votingId: string | null
}

export function PollGrid({ question, category, nominees, onVote, votingId }: PollGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <span className="rounded-full border border-vouch-200 bg-vouch-50 px-3 py-1 text-[11px] font-semibold text-vouch-700 uppercase tracking-wider">
          {category ?? 'Campus'}
        </span>
        <h2 className="text-2xl font-bold text-campus-ink leading-tight">{question}</h2>
      </div>
      <p className="text-vouch-500 text-sm">Pick the student who fits best — your vote is anonymous.</p>
      <div className="grid grid-cols-2 gap-4">
        {nominees.map((profile) => (
          <VoteCard
            key={profile.id}
            profile={profile}
            question={question}
            voting={votingId !== null}
            onVote={() => onVote(profile.id)}
          />
        ))}
      </div>
    </div>
  )
}
