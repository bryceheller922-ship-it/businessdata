import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'

export const metadata: Metadata = {
  title: 'Vouch.School — Anonymous campus compliments',
  description: 'Pick your campus, vote in daily superlative brackets, and receive anonymous compliments.',
  openGraph: {
    title: 'Vouch.School',
    description: 'Anonymous campus compliment brackets. Vote, receive compliments, share to unlock hints.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <div className="relative min-h-screen flex flex-col">
          {children}
        </div>
        <Navbar />
      </body>
    </html>
  )
}
