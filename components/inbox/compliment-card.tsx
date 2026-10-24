'use client'

import { Sparkles, ShieldCheck, User2 } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface ComplimentCardProps {
  poll: {
    poll_id: string
    question_text: string
    category?: string | null
    vote_count: number
    hint_text?: string | null
    unlocked: boolean
  }
  onUnlock: () => void
  unlocking: boolean
}

export function ComplimentCard({ poll, onUnlock, unlocking }: ComplimentCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-vouch-600" strokeWidth={2} />
            <span className="text-xs font-semibold text-vouch-700 uppercase tracking-wider">
              {poll.category ?? 'Compliment'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-campus-ink">{poll.question_text}</h3>
          <p className="text-xs text-vouch-500 mt-1">
            {poll.vote_count} {poll.vote_count === 1 ? 'vote' : 'votes'}
          </p>
        </div>
        <div className="flex flex-col justify-between">
          <div className="text-right">
            {poll.unlocked ? (
              <span className="flex items-center gap-1.5 text-vouch-600 font-semibold">
                <ShieldCheck size={14} strokeWidth={2} />
                Hint unlocked
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-vouch-500 font-semibold">
                <User2 size={14} strokeWidth={2} />
                Who voted?
              </span>
            )}
          </div>
          {poll.hint_text && poll.unlocked ? (
            <div className="mt-3 rounded-xl border border-vouch-100 bg-vouch-50 p-3 text-vouch-800 text-sm italic">
              “{poll.hint_text}”
            </div>
          ) : null}
        </div>
      </div>
      {!poll.unlocked && (
        <button
          onClick={onUnlock}
          disabled={unlocking}
          className="w-full rounded-xl border border-vouch-200 bg-vouch-50/50 px-4 py-3 text-vouch-600 font-semibold hover:bg-vouch-100 transition-colors disabled:opacity-60 group"
        >
          <span className="flex items-center justify-center gap-2">
            Reveal a hint about who voted
            <span className="text-[10px]">→</span>
          </span>
        </button>
      )}
    </Card>
  )
}
