import type { Metadata } from 'next';
import AuthGuard from '@/components/layout/AuthGuard';
import AccountSidebar from '@/components/account/AccountSidebar';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <div className="lg:flex lg:items-start lg:gap-10">
          <AccountSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
