const TAMIL_NADU = 'Tamil Nadu';
const TN_SHIPPING = 40;
const DEFAULT_SHIPPING = 60;
// Must match calculateShipping() in the backend (services/shipping.js) —
// this is a display estimate only; the server always computes the charge
// actually billed, but a mismatched threshold would show a misleading total.
const FREE_SHIPPING_THRESHOLD = 999;

export function validatePincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

export async function lookupPincodeState(pincode: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      return data[0].PostOffice[0].State ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function calculateShippingCharge(state: string, subtotal = 0): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return state === TAMIL_NADU ? TN_SHIPPING : DEFAULT_SHIPPING;
}
