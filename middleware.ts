import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response that we can mutate (to set auth cookies, etc.)
  let response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            path: options.path ?? '/',
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            path: options.path ?? '/',
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname === '/' || pathname.startsWith('/auth')
  const isPublic = isAuthRoute || pathname.startsWith('/share') || pathname.startsWith('/api')

  // Protected routes: require a session
  if (!isPublic && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Already signed in on the landing page → go straight to voting
  if (isAuthRoute && user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/vote'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)'],
}
