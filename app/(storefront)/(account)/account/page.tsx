import type { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = { title: 'My Account' };

export default function AccountPage() {
  return <ProfileClient />;
}
