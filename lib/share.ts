import { Product } from '@/types/product';
import { formatPrice } from './formatters';
import { slugify } from './utils';

/**
 * Generates the full product URL.
 * On the server, it returns a relative path or uses an environment variable if available.
 * On the client, it uses window.location.origin.
 */
export const generateProductUrl = (product: Product): string => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || '';
  
  // Ensure we use a clean slug. If the product has a slug, use it. 
  // If not (fallback), generate one from the name.
  const slug = product.slug || slugify(product.name);
  
  return `${baseUrl}/products/${slug}`;
};

/**
 * Copies text to the clipboard.
 * Returns true if successful, false otherwise.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return false;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

/**
 * Opens WhatsApp with a pre-filled message about the product.
 */
export const shareViaWhatsApp = (product: Product): void => {
  if (typeof window === 'undefined') return;
  
  const url = generateProductUrl(product);
  const formattedPrice = formatPrice(product.price);
  
  const message = `Check out this product on ZyncMart\n\n*${product.name}*\nPrice: ${formattedPrice}\n\nLink: ${url}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Shares a product using the Web Share API.
 * Falls back to copying the link to the clipboard if the API is not supported.
 * Returns the result of the action.
 */
export const shareProduct = async (product: Product): Promise<'shared' | 'copied' | 'failed'> => {
  if (typeof window === 'undefined') return 'failed';

  const url = generateProductUrl(product);
  const shareData = {
    title: product.name,
    text: product.shortDescription || `Check out ${product.name} on ZyncMart`,
    url: url,
  };

  // Check if Web Share API is supported and can share the data
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return 'shared';
    } catch (err) {
      // Ignore abort errors (user cancelled)
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
        return 'failed';
      }
      return 'failed';
    }
  } else {
    // Fallback: copy to clipboard
    const success = await copyToClipboard(url);
    return success ? 'copied' : 'failed';
  }
};
