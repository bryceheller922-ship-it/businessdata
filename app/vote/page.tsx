'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, Trophy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { PollGrid } from '@/components/voting/poll-grid'
import { createClient } from '@/lib/supabase/browser'

interface Nominee {
  id: string
  instagram_handle?: string | null
  avatar_url?: string | null
  vote_points?: number
}

export default function VotePage() {
  const router = useRouter()
  const supabase = createClient()
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [poll, setPoll] = useState<{
    id: string
    question_text: string
    category?: string | null
    active_until: string
  } | null>(null)
  const [nominees, setNominees] = useState<Nominee[]>([])
  const [loading, setLoading] = useState(true)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const mounted = useRef(false)

  const load = useCallback(async () => {
    if (mounted.current) return
    mounted.current = true

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()
    setSchoolId(profile?.school_id ?? null)

    // 1. Pick the next active poll for this school
    const now = new Date().toISOString()
    const { data: polls } = await supabase
      .from('polls')
      .select('id, question_text, category, active_until')
      .eq('school_id', profile?.school_id)
      .gt('active_until', now)
      .order('active_until', { ascending: true })
      .limit(1)

    const activePoll = polls?.[0] ?? null
    setPoll(activePoll)

    // 2. Fetch random schoolmates (excluding self) as nominees
    if (activePoll && profile?.school_id) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, instagram_handle, avatar_url, vote_points')
        .eq('school_id', profile.school_id)
        .neq('id', user.id)

      const shuffled = (profiles ?? []).sort(() => 0.5 - Math.random()).slice(0, 4)
      setNominees(shuffled)
    } else {
      setNominees([])
    }

    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    load()
  }, [load])

  async function handleVote(nomineeId: string) {
    if (votingId) return
    setVotingId(nomineeId)

    const { data: count, error } = await supabase.rpc('cast_vote', {
      p_poll_id: poll!.id,
      p_nominee_id: nomineeId,
    })

    if (error) {
      alert(error.message || 'Vote failed')
      setVotingId(null)
      return
    }

    // Instantly load the next question
    await new Promise((r) => setTimeout(r, 600))
    setVotingId(null)
    await load()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6">
        <div className="animate-pulse rounded-full h-12 w-12 bg-vouch-200 mb-4"></div>
        <p className="text-vouch-600 text-sm">Loading today's brackets&hellip;</p>
      </div>
    )
  }

  if (done || !poll) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center safe-area-bottom">
        <div className="w-16 h-16 rounded-full bg-vouch-100 flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-vouch-600" strokeWidth={2} />
        </div>
        <CardTitle>All caught up</CardTitle>
        <p className="text-vouch-500 text-sm mt-2">
          No active polls for your campus right now. Check back tomorrow.
        </p>
        <div className="mt-6">
          <Button
            asChild
            className="w-auto"
            variant="outline"
            onClick={() => router.replace('/inbox')}
          >
            <ArrowRight className="h-4 w-4 mr-2" strokeWidth={2} />
            Check your inbox
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] p-4 pb-24 safe-area-bottom">
      <div className="flex items-center justify-between mb-6">
        <CardTitle className="text-xl">Vote anonymously</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => router.replace('/inbox')}>
          Inbox
        </Button>
      </div>

      <PollGrid
        question={poll.question_text}
        category={poll.category}
        nominees={nominees}
        onVote={handleVote}
        votingId={votingId}
      />

      <div className="mt-auto">
        <div className="flex items-center justify-between px-4">
          <span className="text-xs text-vouch-400">
            Vote for a schoolmate at your school
          </span>
          <span className="text-xs font-medium text-vouch-600">
            Poll ends {new Date(poll.active_until).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}
