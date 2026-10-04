import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import FooterCategoryLinks from './FooterCategoryLinks';

const LINK = 'inline-block py-1 text-sm text-white/70 transition-colors hover:text-white';

const ACCOUNT_LINKS = [
  { label: 'My account', href: '/account' },
  { label: 'My orders', href: '/account/orders' },
  { label: 'Wishlist', href: '/account/wishlist' },
  { label: 'Addresses', href: '/account/addresses' },
];

// Slugs must match app/(storefront)/(cms)/policies/[slug].
const HELP_LINKS = [
  { label: 'About us', href: '/about' },
  { label: 'Contact us', href: '/contact' },
  { label: 'Shipping policy', href: '/policies/shipping' },
  { label: 'Returns & refunds', href: '/policies/returns' },
  { label: 'Privacy policy', href: '/policies/privacy' },
  { label: 'Terms & conditions', href: '/policies/terms' },
];

// Each line reflects implemented behaviour: free shipping from ₹999 and COD up
// to ₹10,000 (backend shipping policy), Razorpay payments, and the published
// returns policy (eligible items, 7 days).
const ASSURANCES = [
  { icon: Truck, text: 'Free shipping on orders from ₹999' },
  { icon: ShieldCheck, text: 'Secure payments by Razorpay · Cash on delivery' },
  { icon: RotateCcw, text: '7-day returns on eligible items', href: '/policies/returns' },
];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-white">{title}</h2>
      <ul>{children}</ul>
    </div>
  );
}

export default function Footer() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zyncmart';
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="mt-auto bg-ink text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-5">
          <div className="col-span-2">
            <span className="relative block h-9 w-[156px]">
              <Image src="/zyncmart_logo.png" alt="Zyncmart" fill sizes="160px" className="object-cover" />
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">Jewellery, toys and home accessories, delivered across India.</p>
            <ul className="mt-5 space-y-2">
              {ASSURANCES.map(({ icon: Icon, text, href }) => (
                <li key={text} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-white/60" aria-hidden="true" />
                  {href ? (
                    <Link href={href} className="hover:text-white hover:underline">
                      {text}
                    </Link>
                  ) : (
                    text
                  )}
                </li>
              ))}
            </ul>
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi, I need help with my order')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-10 items-center rounded-lg border border-white/20 px-4 text-sm font-medium text-white hover:bg-white/10"
              >
                WhatsApp support
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>

          <Column title="Shop">
            <li>
              <Link href="/products" className={LINK}>
                All products
              </Link>
            </li>
            <FooterCategoryLinks linkClassName={LINK} />
          </Column>

          <Column title="Account">
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={LINK}>
                  {link.label}
                </Link>
              </li>
            ))}
          </Column>

          <Column title="Help">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={LINK}>
                  {link.label}
                </Link>
              </li>
            ))}
          </Column>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
