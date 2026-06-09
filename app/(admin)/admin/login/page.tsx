import { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminLoginClient from './AdminLoginClient';

export const metadata: Metadata = {
  title: 'Admin Login | Zyncmart',
  description: 'Admin sign-in page for Zyncmart dashboard access.',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>}>
      <AdminLoginClient />
    </Suspense>
  );
}
