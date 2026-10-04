'use client';

import React, { useState } from 'react';
import { Share2, Link as LinkIcon, MessageCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { shareProduct, shareViaWhatsApp, copyToClipboard, generateProductUrl } from '@/lib/share';
import { cn } from '@/lib/utils';
import { buttonClasses } from '@/components/ui/Button';

interface ProductShareProps {
  product: Product;
  className?: string;
}

const SHARE_BUTTON = buttonClasses({ variant: 'outline', size: 'sm' });

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
    if (result === 'copied') toast.success('Link copied to clipboard');
    else if (result === 'failed') toast.error('Failed to share product');
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="group" aria-label="Share this product">
      <span className="mr-1 text-sm font-medium text-foreground">Share</span>
      <button type="button" onClick={handleCopy} className={SHARE_BUTTON}>
        {copied ? <Check className="h-4 w-4 text-success" aria-hidden="true" /> : <LinkIcon className="h-4 w-4" aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <button type="button" onClick={() => shareViaWhatsApp(product)} className={SHARE_BUTTON}>
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        WhatsApp
      </button>
      <button type="button" onClick={handleNativeShare} className={SHARE_BUTTON} aria-label="More sharing options">
        <Share2 className="h-4 w-4" aria-hidden="true" />
        More
      </button>
    </div>
  );
};

export default ProductShare;
