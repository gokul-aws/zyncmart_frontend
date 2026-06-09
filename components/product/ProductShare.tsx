'use client';

import React, { useState } from 'react';
import { Share2, Link, MessageCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { 
  shareProduct, 
  shareViaWhatsApp, 
  copyToClipboard, 
  generateProductUrl 
} from '@/lib/share';
import { cn } from '@/lib/utils';

interface ProductShareProps {
  product: Product;
  className?: string;
}

export const ProductShare: React.FC<ProductShareProps> = ({ product, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = generateProductUrl(product);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    const result = await shareProduct(product);
    if (result === 'copied') {
      toast.success('Link copied to clipboard');
    } else if (result === 'failed') {
      toast.error('Failed to share product');
    }
  };

  const handleWhatsAppShare = () => {
    shareViaWhatsApp(product);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="text-sm font-medium text-gray-700">Share this product:</span>
      <div className="flex flex-wrap items-center gap-2">
        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Copy Link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Link className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* WhatsApp Share Button */}
        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white transition-colors bg-[#25D366] rounded-lg shadow-sm hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
          title="Share via WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        {/* Web Share API Button (Native Share) */}
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors bg-gray-100 border border-transparent rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          title="More sharing options"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};

export default ProductShare;
