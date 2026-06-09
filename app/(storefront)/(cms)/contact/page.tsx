import type { Metadata } from 'next';
import ContactClient from './ContactClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with our support team.',
  alternates: { canonical: `${SITE_URL}/contact` },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return <ContactClient />;
}
