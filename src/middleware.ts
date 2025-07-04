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
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Get tokens from cookies - middleware can't access localStorage
  const accessToken = request.cookies.get('accessToken')?.value;
  const userType = request.cookies.get('userType')?.value;
  
  // Only log for actual navigation, not for frequent checks
  if (!pathname.includes('/_next') && !pathname.includes('.')) {
    console.log('🔍 Middleware check:', { 
      pathname, 
      hasToken: !!accessToken, 
      userType
    });
  }
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Special handling for root path
  if (pathname === '/') {
    if (accessToken && userType) {
      const dashboardUrl = getDashboardUrl(userType);
      console.log('Root path access with auth, redirecting to dashboard:', dashboardUrl);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    } else {
      // Non-authenticated users stay on landing page
      return NextResponse.next();
    }
  }
  
  // For auth pages (login, register, etc.), redirect authenticated users to their dashboard
  if (pathname.startsWith('/auth/')) {
    if (accessToken && userType) {
      const dashboardUrl = getDashboardUrl(userType);
      console.log('Auth page access with existing auth, redirecting to dashboard:', dashboardUrl);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    } else {
      // Allow access to auth pages for non-authenticated users
      return NextResponse.next();
    }
  }
  
  // If route is public (but not auth pages), allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check if route is protected
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  ) as keyof typeof protectedRoutes;
  
  if (protectedRoute) {
    // If no access token, redirect to login
    if (!accessToken) {
      console.log('No access token, redirecting to login');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // If user type doesn't match required types for this route
    if (userType && !(protectedRoutes[protectedRoute] as readonly string[]).includes(userType)) {
      console.log('Wrong user type, redirecting to correct dashboard', { userType, requiredTypes: protectedRoutes[protectedRoute] });
      const dashboardUrl = getDashboardUrl(userType);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    
    // Allow access to protected route
    return NextResponse.next();
  }
  
  // For any other routes with authenticated users, redirect to their dashboard
  if (accessToken && userType) {
    const dashboardUrl = getDashboardUrl(userType);
    console.log('Authenticated user on unprotected route, redirecting to dashboard:', dashboardUrl);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }
  
  // Continue with the request for non-authenticated users on non-protected routes
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