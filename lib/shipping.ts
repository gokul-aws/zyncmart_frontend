const TAMIL_NADU = 'Tamil Nadu';
const TN_SHIPPING = 40;
const DEFAULT_SHIPPING = 60;

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

export function calculateShippingCharge(state: string): number {
  return state === TAMIL_NADU ? TN_SHIPPING : DEFAULT_SHIPPING;
}
