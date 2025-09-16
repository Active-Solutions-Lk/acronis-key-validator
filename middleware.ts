import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware identifies protected routes but doesn't enforce authentication
// Authentication is handled client-side in the dashboard components

export function middleware(request: NextRequest) {
  // This middleware is here to identify protected routes
  // Actual authentication is handled client-side in dashboard components
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/dashboard/:path*'],
}