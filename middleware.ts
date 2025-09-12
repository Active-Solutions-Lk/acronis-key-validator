import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define which routes should be protected
const protectedRoutes = ['/dashboard']

export function middleware(request: NextRequest) {
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  if (isProtectedRoute) {
    // For protected routes, we could check for authentication here
    // But since we're using client-side auth, we'll let the client handle it
    // This middleware is here to potentially add server-side auth later
  }
  
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/dashboard/:path*'],
}