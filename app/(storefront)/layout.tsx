import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="sr-only z-50 rounded-md bg-surface px-4 py-2 text-sm font-semibold text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Header />
      {/* Bottom padding keeps content clear of the fixed mobile navigation. */}
      <main id="main-content" className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </>
  );
}
