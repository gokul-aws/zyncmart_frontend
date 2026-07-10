import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminLoginClient from './AdminLoginClient';

// TODO: Admin Sign In is temporarily disabled as a separate UI entry point.
// Customers and admins now both sign in via /login, which redirects admins
// to /admin/dashboard based on their role after authentication (see
// hooks/useAuth.ts). This route/page is intentionally left in the codebase
// and still works if navigated to directly, but nothing in the UI links here
// anymore (see components/layout/AdminGuard.tsx and middleware.ts).
export const metadata: Metadata = {
  title: 'Admin Login | Zyncmart',
  description: 'Admin sign-in page for Zyncmart dashboard access.',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginClient />
    </Suspense>
  );
}
