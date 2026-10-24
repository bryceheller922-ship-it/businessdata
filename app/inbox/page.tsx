'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, ShieldCheck, User2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { ComplimentCard } from '@/components/inbox/compliment-card'
import { ShareModal } from '@/components/viral/share-modal'
import { createClient } from '@/lib/supabase/browser'

interface Compliment {
  poll_id: string
  question_text: string
  category?: string | null
  vote_count: number
  hint_text?: string | null
  unlocked: boolean
}

export default function InboxPage() {
  const supabase = createClient()
  const [compliments, setCompliments] = useState<Compliment[]>([])
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [modalPoll, setModalPoll] = useState<{ poll_id: string; question_text: string } | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_my_compliments')
    if (error) {
      console.error(error)
      return
    }
    setCompliments((data ?? []) as Compliment[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  const handleUnlock = (c: Compliment) => {
    setModalPoll({ poll_id: c.poll_id, question_text: c.question_text })
    setOpen(true)
  }

  const onHintUnlocked = (hint: string) => {
    setCompliments((prev) =>
      prev.map((c) =>
        c.poll_id === modalPoll?.poll_id
          ? { ...c, unlocked: true, hint_text: hint }
          : c
      )
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-pulse rounded-full h-12 w-12 bg-vouch-200 mb-4"></div>
        <p className="text-vouch-600 text-sm">Fetching your compliments&hellip;</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] p-4 pb-24 safe-area-bottom">
      <div className="flex items-center justify-between mb-6">
        <CardTitle className="text-xl">Inbox</CardTitle>
        <Button variant="outline" size="sm" onClick={() => window.location.assign('/vote')}>
          Vote
        </Button>
      </div>

      {compliments.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="w-16 h-16 rounded-full bg-vouch-100 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-vouch-400" strokeWidth={2} />
          </div>
          <CardTitle>No compliments yet</CardTitle>
          <p className="text-vouch-500 text-sm mt-2">
            Vote on campus superlatives and wait for friends to vote for you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {compliments.map((c) => (
            <ComplimentCard
              key={c.poll_id}
              poll={c}
              onUnlock={() => handleUnlock(c)}
              unlocking={unlocking === c.poll_id}
            />
          ))}
        </div>
      )}

      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        poll={modalPoll!}
        onHintUnlocked={onHintUnlocked}
      />
    </div>
  )
}
