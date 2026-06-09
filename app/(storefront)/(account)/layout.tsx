import type { Metadata } from 'next';
import AuthGuard from '@/components/layout/AuthGuard';
import AccountSidebar from '@/components/account/AccountSidebar';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile: simple top nav tabs are rendered inside each page; sidebar is desktop-only */}
        <div className="flex gap-8 items-start">
          <div className="hidden lg:block">
            <AccountSidebar />
          </div>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
