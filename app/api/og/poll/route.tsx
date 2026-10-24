/**
 * Dynamic OG image route for Vouch.School viral share cards.
 *
 * Usage: /api/og/poll?token=abc&question=Best%20dressed%3F&school=Lincoln%20High&from=Alex
 *
 * Runs on the Edge runtime for fast, cached image generation at share time.
 */
import { createElement } from 'react'
import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

interface ImageRequest {
  question?: string
  school?: string
  from?: string
  token?: string
}

export async function GET(request: Request) {
  const searchParams: ImageRequest = Object.fromEntries(
    new URL(request.url).searchParams.entries()
  )
  const question = decodeURIComponent(searchParams.question || 'Best dressed?')
  const school = decodeURIComponent(searchParams.school || 'Your school')
  const from = decodeURIComponent(searchParams.from || 'A friend')
  const token = searchParams.token || ''
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://vouch.school'
  const shareUrl = `${baseUrl}/share/${token}`

  const S = (tag: string, props: Record<string, unknown>, ...children: unknown[]) =>
    createElement(tag, props, ...children)

  return new ImageResponse(
    S('div', {
      style: {
        width: 1200,
        height: 630,
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial',
        padding: 40,
        boxSizing: 'border-box',
      },
    },
      S('div', {
        style: {
          width: 1000,
          background: 'rgba(255, 255, 255, 0.92)',
          borderRadius: 32,
          padding: 48,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        },
      },
        S('div', {
          style: {
            width: 64, height: 64, background: '#f59e0b', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          },
        }),
        S('div', {
          style: {
            fontSize: 40, fontWeight: 900, color: '#111827', textAlign: 'center', lineHeight: 1.15,
          },
        }, `"${question}"`),
        S('div', {
          style: {
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            alignItems: 'center', gap: 4, fontSize: 20, color: '#4b5563', textAlign: 'center',
          },
        },
          S('span', {}, 'A compliment from '),
          S('span', { style: { color: '#6366f1', fontWeight: 700 } }, from),
          S('span', {}, ' at '),
          S('span', { style: { color: '#a855f7', fontWeight: 700 } }, school),
        ),
        S('div', {
          style: {
            display: 'flex', width: '100%', height: 10, background: '#e5e7eb',
            borderRadius: 5, overflow: 'hidden',
          },
        }, S('div', {
          style: { height: '100%', width: '70%', background: 'linear-gradient(90deg, #6366f1, #a855f7)' },
        })),
        S('div', {
          style: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 1.4 },
        }, 'Tap to see who voted — and vote back anonymously on Vouch.School'),
        S('div', {
          style: {
            marginTop: 16, fontSize: 13, color: '#9ca3af', background: '#f3f4f6',
            padding: 12, borderRadius: 10, wordBreak: 'break-all',
          },
        }, shareUrl),
      )),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
