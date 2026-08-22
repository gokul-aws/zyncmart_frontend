import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` (same
// runtime behavior). This is an OPTIMISTIC, second layer of route
// protection that runs before the client-side AuthGuard/AdminGuard
// components mount — it only reads cookies (no DB calls), so it must never
// be treated as the source of truth. The backend's `authenticate`/
// `requireAdmin` middleware is the real authority; this just avoids briefly
// serving a protected shell to an obviously-unauthenticated visitor, or
// bouncing a signed-in visitor back through the auth pages.
//
// `refreshToken` and `auth-role` are both set (and cleared together) by
// lib/store/authStore.ts. Neither is a secret on its own: refreshToken is
// already a plain, non-HttpOnly cookie in this app's architecture (it has
// to be readable by the axios client to drive the refresh flow), and
// auth-role is just the user's role, not a credential.
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
    request.cookies.has('refreshToken') || !!request.headers.get('authorization');

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

  // Optimistic role check for /admin/*: only redirect when we positively
  // know the role is non-admin. A missing/stale cookie falls through to
  // AdminGuard, which verifies against the live `user` object instead of
  // guessing.
  if (isAdminProtectedRoute && hasAuth) {
    const role = request.cookies.get('auth-role')?.value;
    if (role && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
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
