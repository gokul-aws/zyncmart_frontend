import api from './axios';

export interface ShippingQuote {
  shipping: number;
  freeShipping: boolean;
  estimatedDays: string;
  method: string;
}

// Authoritative shipping quote from the backend. The frontend must display
// this value instead of computing charges locally.
export async function calculateShippingRate(
  pincode: string,
  subtotal: number
): Promise<ShippingQuote> {
  const { data } = await api.post('/shipping/calculate', { pincode, subtotal });
  return data.data as ShippingQuote;
}
