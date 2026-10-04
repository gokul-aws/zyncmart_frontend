import Link from 'next/link';
import { Banknote, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

// Only claims backed by the application: free shipping from ₹999 and COD up
// to ₹10,000 (backend shipping policy), Razorpay payments, and the published
// returns policy (/policies/returns: 7 days, eligible items).
const ITEMS = [
  { icon: Truck, title: 'Free shipping', text: 'On orders from ₹999' },
  { icon: Banknote, title: 'Cash on delivery', text: 'On orders up to ₹10,000' },
  { icon: ShieldCheck, title: 'Secure payments', text: 'UPI, cards & net banking via Razorpay' },
  { icon: RotateCcw, title: '7-day returns', text: 'On eligible items', href: '/policies/returns' },
];

export default function TrustStrip() {
  return (
    <section aria-label="Shopping with Zyncmart" className="border-b border-border bg-surface">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
        {ITEMS.map(({ icon: Icon, title, text, href }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                {href ? (
                  <Link href={href} className="hover:underline">
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </span>
              <span className="block text-sm text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
