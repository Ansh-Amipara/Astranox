import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that require authentication
const protectedRoutes = [
  '/team',
  '/bag',
  '/gyms',
  '/pokemart',
  '/fight',
  '/home',
  '/trainers'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Check if refreshToken cookie exists.
    // NOTE: This does NOT validate the token, that happens on the backend.
    const hasRefreshToken = request.cookies.has('refreshToken');
    
    if (!hasRefreshToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check admin routes separately
  if (pathname.startsWith('/admin')) {
    const hasRefreshToken = request.cookies.has('refreshToken');
    if (!hasRefreshToken && !pathname.startsWith('/admin-login')) {
      const loginUrl = new URL('/admin-login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
