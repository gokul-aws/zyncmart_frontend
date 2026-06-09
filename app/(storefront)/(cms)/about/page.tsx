import type { Metadata } from 'next';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Store';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn about ${SITE_NAME} — premium jewellery, toys, and home accessories for Indian families.`,
  alternates: { canonical: `${SITE_URL}/about` },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">About {SITE_NAME}</h1>
      <p className="text-gray-500 text-sm mb-8">Crafted with love for Indian families</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
        <p>
          Welcome to <strong>{SITE_NAME}</strong> — your trusted destination for premium jewellery,
          toys, and home accessories designed for Indian families.
        </p>
        <p>
          We believe shopping should be joyful, trustworthy, and convenient. From delicate gold-plated
          jewellery to safe, educational toys and elegant home décor, every product in our collection
          is curated to bring warmth and quality into your home.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Our Mission</h2>
        <p>
          To make premium, authentic products accessible to every Indian household — with transparent
          pricing, hassle-free returns, and a shopping experience built on trust.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Why Choose Us?</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Carefully curated, quality-verified products</li>
          <li>Free shipping on orders above ₹999</li>
          <li>Easy 7-day returns and exchanges</li>
          <li>Cash on Delivery available across India</li>
          <li>Dedicated customer support via WhatsApp</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Get in Touch</h2>
        <p>
          Have questions? We&apos;d love to hear from you.{' '}
          <a href="/contact" className="text-primary hover:underline">Contact us</a> or reach
          us directly on WhatsApp for the fastest response.
        </p>
      </div>
    </div>
  );
}
