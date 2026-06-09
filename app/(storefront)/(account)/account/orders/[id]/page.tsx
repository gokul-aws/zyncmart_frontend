import type { Metadata } from 'next';
import OrderDetailClient from './OrderDetailClient';

export const metadata: Metadata = { title: 'Order Details' };

type Params = Promise<{ id: string }>;

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return <OrderDetailClient id={id} />;
}

