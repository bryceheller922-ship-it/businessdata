'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, School, Sparkles, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/browser'

function OnboardingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/vote'
  const supabase = createClient()
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([])
  const [schoolId, setSchoolId] = useState<string>('')
  const [email, setEmail] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSchools()
  }, [])

  async function loadSchools() {
    const { data } = await supabase.from('schools').select('id, name').order('name')
    setSchools(data ?? [])
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setLoading(true)
      try {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              instagram_handle: instagramHandle,
              school_id: schoolId,
            },
          },
        })

        if (authError) throw authError

        if (data.user && !data.session) {
          // Email confirmation required — tell the user
          setError(
            'Confirmation email sent. Please confirm your email before signing in.'
          )
          setLoading(false)
          return
        }

        // Profile is created by the client (RLS allows own insert) after session exists
        await createProfile(data.user?.id)
        router.replace(redirect)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    },
    [email, password, instagramHandle, schoolId, router, redirect, supabase]
  )

  async function createProfile(userId: string | undefined) {
    if (!userId) return
    await supabase.from('profiles').insert({
      id: userId,
      instagram_handle: instagramHandle || null,
      school_id: schoolId || null,
      avatar_url: null,
      vote_points: 0,
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-safe-zero min-h-[100dvh] px-6 pt-10 pb-24">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-xl bg-vouch-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <span className="text-2xl font-black tracking-tighter text-campus-ink">
          VOUCH.
        </span>
        <span className="text-2xl font-black tracking-tighter text-vouch-600">SCHOOL</span>
      </div>
      <p className="mt-2 text-vouch-500 text-sm text-center">
        Anonymous campus compliment brackets
      </p>

      <Card className="w-full max-w-md mt-10">
        <CardHeader>
          <CardTitle className="text-center">Join your campus</CardTitle>
          <p className="text-center text-vouch-500 text-sm">
            Pick your school and create your account
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-vouch-600 uppercase tracking-wider">
              School
            </label>
            <Select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
            >
              <option value="" disabled hidden>
                Select your school
              </option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-vouch-600 uppercase tracking-wider">
              School email
            </label>
            <Input
              type="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-vouch-600 uppercase tracking-wider">
              Instagram handle
            </label>
            <Input
              placeholder="@handle"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-vouch-600 uppercase tracking-wider">
              Password
            </label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" onClick={handleSubmit} loading={loading} className="w-full">
            <UserPlus className="h-4 w-4 mr-2" strokeWidth={2} />
            Create account &rarr;
          </Button>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-vouch-400 text-center">
        Log in via school email. Instagram handle appears on your profile so
        friends know who to vote for.
      </p>
    </div>
  )
}

export default function Onboarding() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pt-10 pb-24">
        <div className="animate-pulse rounded-full h-12 w-12 bg-vouch-200 mb-4"></div>
        <p className="text-vouch-600 text-sm">Loading campus&hellip;</p>
      </div>
    }>
      <OnboardingInner />
    </Suspense>
  )
}
