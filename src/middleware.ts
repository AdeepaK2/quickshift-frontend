// middleware.ts (place in root directory)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their allowed user types
const protectedRoutes = {
  '/admin': ['admin'],
  '/employer': ['employer'],
  '/undergraduate': ['user'],
} as const;

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/verify-otp',
  '/auth/reset-password',
];

// Public authentication routes
// (We're not handling auto-redirection in middleware anymore, doing it client-side)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get tokens from cookies or headers - middleware can't access localStorage
  // We need to rely on cookies or headers for middleware authentication
  const accessToken = request.cookies.get('accessToken')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '');
  const userType = request.cookies.get('userType')?.value;
    // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // For middleware, we'll have limited auth functionality since we can't access localStorage
  // Client-side redirections in login/auth context will handle most auth redirections
  
  // If route is public and user is not accessing a protected route, allow access
  if (isPublicRoute && !Object.keys(protectedRoutes).some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
    // Check if route is protected
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  ) as keyof typeof protectedRoutes;
  
  if (protectedRoute) {
    // If no access token, redirect to login
    if (!accessToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // If user type doesn't match required types for this route
    if (userType && !(protectedRoutes[protectedRoute] as readonly string[]).includes(userType)) {
      const dashboardUrl = getDashboardUrl(userType);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

function getDashboardUrl(userType: string): string {
  switch (userType) {
    case 'admin':
      return '/admin';
    case 'employer':
      return '/employer';
    case 'user':
      return '/undergraduate';
    default:
      return '/auth/login';
  }
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};