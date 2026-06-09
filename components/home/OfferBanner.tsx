import Link from 'next/link';
import { Truck, Tag, RefreshCw } from 'lucide-react';

const PERKS = [
  { icon: Truck, text: 'Free shipping on orders above ₹999' },
  { icon: Tag, text: 'Use code WELCOME10 for 10% off your first order' },
  { icon: RefreshCw, text: 'Easy 7-day returns on all products' },
];

export default function OfferBanner() {
  return (
    <section className="bg-gradient-to-r from-secondary to-primary text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: single scrolling message */}
        <div className="flex md:hidden items-center justify-center gap-2 text-sm font-medium">
          <Truck className="w-4 h-4 text-accent flex-none" />
          <span>Free shipping on orders above ₹999</span>
        </div>

        {/* Desktop: three perks in a row */}
        <div className="hidden md:flex items-center justify-center divide-x divide-gray-700">
          {PERKS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 px-8 text-sm">
              <Icon className="w-4 h-4 text-accent flex-none" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
