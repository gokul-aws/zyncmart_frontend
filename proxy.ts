import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/account', '/checkout', '/my-orders'];
const ADMIN_PROTECTED = ['/admin'];
const AUTH_ONLY = ['/login', '/register', '/forgot-password'];
const ADMIN_AUTH_ONLY = ['/admin/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  const hasAuth =
    request.cookies.has('refreshToken') ||
    !!request.headers.get('authorization');

  const isAdminLoginPage = ADMIN_AUTH_ONLY.some((p) => pathname.startsWith(p));
  const isAdminProtectedRoute = ADMIN_PROTECTED.some((p) => pathname.startsWith(p)) && !isAdminLoginPage;
  const isProtectedRoute = PROTECTED.some((p) => pathname.startsWith(p)) || isAdminProtectedRoute;

  if (isProtectedRoute && !hasAuth) {
    // TODO: Admin Sign In is temporarily disabled as a separate UI entry point.
    // Everyone (customer or admin) now authenticates through the unified
    // /login page; useAuth.signIn() redirects admins to /admin/dashboard
    // after checking their role. The /admin/login route/page itself is left
    // in the codebase, just unreachable via app navigation or this redirect.
    // const redirectUrl = pathname.startsWith('/admin') ? '/admin/login' : '/login';
    const redirectUrl = '/login';
    const loginUrl = new URL(redirectUrl, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && hasAuth && !request.nextUrl.searchParams.has('redirect')) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  if (isAdminLoginPage && hasAuth && !request.nextUrl.searchParams.has('redirect')) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/my-orders',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
