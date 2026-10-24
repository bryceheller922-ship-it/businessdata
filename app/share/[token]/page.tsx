import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

interface SharePageProps {
  params: { token: string }
}

export default async function SharePage({ params }: SharePageProps) {
  const token = Array.isArray(params.token) ? params.token[0] : params.token

  let poll: { question_text: string; category?: string | null } | null = null
  let sharedAt: string | null = null

  try {
    const supabase = await createClient()
    const { data: share, error } = await supabase
      .from('shares')
      .select('poll_id, shared_at, platform')
      .eq('share_token', token)
      .single()

    if (!error && share) {
      sharedAt = share.shared_at
      const { data: p } = await supabase
        .from('polls')
        .select('question_text, category')
        .eq('id', share.poll_id)
        .single()
      poll = p ?? null
    }
  } catch {
    // Supabase not configured or unreachable at build time — fall through to
    // the generic shell below so prerendering never crashes.
  }

  if (!poll) {
    notFound()
  }

  return (
    <div className="min-h-safe-zero min-h-[100dvh] flex flex-col items-center justify-center p-6 pt-16 pb-24 bg-vouch-50">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-vouch-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-vouch-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-vouch-600 font-semibold">Vouch.School</span>
        </div>

        <Card>
          <CardTitle className="text-center">Someone voted for you</CardTitle>
          <CardContent className="py-6 space-y-4">
            <p className="text-lg font-semibold text-campus-ink">
              "{poll.question_text}"
            </p>
            <p className="text-vouch-500 text-sm">
              Your friend sent you this from {poll.category ?? 'campus'}.
              Join Vouch.School to vote back and see anonymous compliments.
            </p>

            <Link
              href="/"
              className="block w-full rounded-xl border border-vouch-200 bg-white px-4 py-3 text-center text-sm font-semibold text-vouch-700 shadow-sm hover:bg-vouch-50"
            >
              Join and vote →
            </Link>
          </CardContent>
        </Card>

        <p className="text-xs text-vouch-400">
          Shared via Instagram Story &bull;
          {sharedAt ? new Date(sharedAt).toLocaleDateString() : ''}
        </p>
      </div>
    </div>
  )
}
