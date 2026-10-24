'use client'

import { useCallback, useState } from 'react'
import { Copy, Instagram, Phone, ShieldCheck, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/components/ui/cn'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  poll: {
    poll_id: string
    question_text: string
  }
  onHintUnlocked: (hint: string) => void
}

export function ShareModal({ open, onClose, poll, onHintUnlocked }: ShareModalProps) {
  const [token, setToken] = useState<string | null>(null)
  const [stage, setStage] = useState<'create' | 'share' | 'unlocked'>('create')
  const [hint, setHint] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : ''

  const createShare = useCallback(async () => {
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/browser')
      const supabase = createClient()
      const { data, error } = await supabase.rpc('create_share', {
        p_poll_id: poll.poll_id,
        p_platform: 'instagram_story',
      })
      if (error) throw error
      setToken(data)
      setStage('share')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not create share link')
    } finally {
      setLoading(false)
    }
  }, [poll.poll_id])

  const unlockHint = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/browser')
      const supabase = createClient()
      const { data: hint, error } = await supabase.rpc('unlock_hint', {
        p_poll_id: poll.poll_id,
        p_reveal_type: 'initial',
      })
      if (error) throw error
      setHint(hint)
      setStage('unlocked')
      onHintUnlocked(hint)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unlock failed — share first')
    } finally {
      setLoading(false)
    }
  }, [token, poll.poll_id, onHintUnlocked])

  const copyLink = async () => {
    if (!token) return
    const url = `${baseUrl}/share/${token}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {}
  }

  if (!open) return null

  const shareUrl = token ? `${baseUrl}/share/${token}` : ''

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white bg-white shadow-2xl animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex justify-between items-start">
          <h2 className="text-xl font-bold text-campus-ink">Unlock a hint</h2>
          <button onClick={onClose} className="rounded-lg text-vouch-400 hover:text-vouch-600">
            <span className="sr-only">Close</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {stage === 'create' && (
          <CardContent className="space-y-4">
            <p className="text-vouch-600 text-sm leading-relaxed">
              Share this compliment to your Instagram Story so your friends can vote
              too. Once shared, you&rsquo;ll unlock a hint about who voted for you.
            </p>
            <div className="rounded-xl border border-vouch-100 bg-vouch-50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Instagram className="h-5 w-5 text-vouch-600" strokeWidth={2} />
                <span className="text-sm font-medium text-vouch-800">Share to Instagram Story</span>
              </div>
              <Button
                onClick={createShare}
                loading={loading}
                className="w-full"
                disabled={loading}
              >
                <Share2 className="h-4 w-4 mr-2" strokeWidth={2} />
                Generate share link
              </Button>
            </div>
          </CardContent>
        )}

        {stage === 'share' && token && (
          <CardContent className="space-y-4">
            <p className="text-vouch-600 text-sm leading-relaxed">
              Your personalized link is ready. Send it to friends so they can vote on
              <em>{poll.question_text}</em>.
            </p>
            <div className="rounded-xl border border-vouch-200 bg-vouch-50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <svg className="h-5 w-5 text-vouch-600" strokeWidth={2} fill="none" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-xs font-mono text-vouch-500 truncate">{shareUrl}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  <Copy size={16} strokeWidth={2} />
                  Copy link
                </Button>
                <Button
                  onClick={unlockHint}
                  className="flex-1"
                  disabled={loading}
                >
                  I shared it — unlock hint
                </Button>
              </div>
              {navigator.share && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator
                      .share({
                        title: 'Vouch.School',
                        text: `Someone voted for you: "${poll.question_text}"`,
                        url: shareUrl,
                      })
                      .catch(() => {})
                  }}
                  disabled={loading}
                >
                  <Phone size={16} strokeWidth={2} />
                  Share
                </Button>
              )}
            </div>
            <p className="text-[11px] text-vouch-400 text-center">
              Posting to your story unlocks an anonymous hint about who voted.
            </p>
          </CardContent>
        )}

        {stage === 'unlocked' && hint && (
          <CardContent className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-vouch-600 font-semibold">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
              Hint unlocked
            </div>
            <div className="rounded-2xl border border-vouch-100 bg-vouch-100 p-4">
              <p className="text-vouch-800 text-sm italic">“{hint}”</p>
            </div>
            <Button onClick={onClose} className="w-full">
              Back to inbox
            </Button>
          </CardContent>
        )}
      </div>
    </div>
  )
}
