import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Store';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

type PolicySlug = 'privacy' | 'terms' | 'returns' | 'shipping';

const POLICIES: Record<PolicySlug, { title: string; content: React.ReactNode }> = {
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>Last updated: January 2025</p>
        <p>
          {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your personal information.
          This Privacy Policy explains how we collect, use, and safeguard your data when you use our website.
        </p>
        <h2 className="text-lg font-semibold text-gray-900">Information We Collect</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Name, email address, and phone number when you create an account</li>
          <li>Shipping addresses for order fulfilment</li>
          <li>Order history and payment status (we do not store card details)</li>
          <li>Browsing behaviour via Google Analytics 4 (anonymised)</li>
        </ul>
        <h2 className="text-lg font-semibold text-gray-900">How We Use Your Data</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Process and fulfil your orders</li>
          <li>Send order confirmations and shipping updates</li>
          <li>Improve our website and personalise your experience</li>
          <li>Respond to your support queries</li>
        </ul>
        <h2 className="text-lg font-semibold text-gray-900">Your Rights</h2>
        <p>You may request deletion or correction of your data by emailing us at support@{SITE_NAME.toLowerCase()}.com.</p>
      </div>
    ),
  },
  terms: {
    title: 'Terms & Conditions',
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>Last updated: January 2025</p>
        <p>By accessing or using {SITE_NAME}, you agree to be bound by these Terms of Service.</p>
        <h2 className="text-lg font-semibold text-gray-900">Use of Service</h2>
        <p>You must be at least 18 years old or have parental consent to make purchases. You agree not to use our platform for fraudulent or unlawful purposes.</p>
        <h2 className="text-lg font-semibold text-gray-900">Orders & Payments</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>All prices are inclusive of GST</li>
          <li>We reserve the right to cancel orders due to inventory or pricing errors</li>
          <li>Payments are processed securely via Razorpay</li>
        </ul>
        <h2 className="text-lg font-semibold text-gray-900">Intellectual Property</h2>
        <p>All content on this website is the property of {SITE_NAME} and may not be reproduced without permission.</p>
      </div>
    ),
  },
  returns: {
    title: 'Returns & Refunds Policy',
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>Last updated: January 2025</p>
        <h2 className="text-lg font-semibold text-gray-900">7-Day Return Policy</h2>
        <p>We accept returns within 7 days of delivery for items that are unused, unwashed, and in their original packaging.</p>
        <h2 className="text-lg font-semibold text-gray-900">Non-Returnable Items</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Earrings and pierced jewellery (for hygiene reasons)</li>
          <li>Personalised / custom-engraved items</li>
          <li>Items purchased during clearance sales</li>
        </ul>
        <h2 className="text-lg font-semibold text-gray-900">Refund Process</h2>
        <p>Once we receive and inspect the returned item, your refund will be processed within 5–7 business days to your original payment method.</p>
        <h2 className="text-lg font-semibold text-gray-900">How to Initiate a Return</h2>
        <p>Contact us on WhatsApp or email with your order number and reason for return.</p>
      </div>
    ),
  },
  shipping: {
    title: 'Shipping Policy',
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>Last updated: January 2025</p>
        <h2 className="text-lg font-semibold text-gray-900">Free Shipping</h2>
        <p>We offer free shipping on all orders above ₹999. A flat shipping fee of ₹99 applies to orders below this threshold.</p>
        <h2 className="text-lg font-semibold text-gray-900">Delivery Timelines</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Metro cities: 3–5 business days</li>
          <li>Tier 2 & 3 cities: 5–7 business days</li>
          <li>Remote areas: 7–10 business days</li>
        </ul>
        <h2 className="text-lg font-semibold text-gray-900">Order Processing</h2>
        <p>Orders are processed Monday–Saturday. Orders placed after 3 PM or on Sundays/public holidays are processed the next business day.</p>
        <h2 className="text-lg font-semibold text-gray-900">Tracking</h2>
        <p>You&apos;ll receive a tracking link via SMS/email once your order is shipped.</p>
      </div>
    ),
  },
};

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug as PolicySlug];
  if (!policy) return { title: 'Policy Not Found' };
  return {
    title: policy.title,
    alternates: { canonical: `${SITE_URL}/policies/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function PolicyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const policy = POLICIES[slug as PolicySlug];
  if (!policy) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{policy.title}</h1>
      <div className="prose prose-gray max-w-none">{policy.content}</div>
    </div>
  );
}
