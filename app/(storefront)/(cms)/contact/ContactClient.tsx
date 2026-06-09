'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Phone, MessageCircle, CheckCircle2 } from 'lucide-react';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(3, 'Subject required'),
  message: z.string().min(10, 'Please write at least 10 characters'),
});
type FormData = z.infer<typeof schema>;

export default function ContactClient() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    // In production: POST to /contact or a third-party email API
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-10">We&apos;re here to help. Reach out anytime.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info column */}
        <div className="space-y-6">
          {[
            { icon: Mail, label: 'Email', value: 'support@zyncmart.com', href: 'mailto:support@zyncmart.com' },
            { icon: Phone, label: 'Phone', value: WHATSAPP ? `+${WHATSAPP}` : '+91 98765 43210', href: `tel:+${WHATSAPP ?? '919876543210'}` },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <a href={href} className="text-sm font-medium text-gray-900 hover:text-primary transition-colors">
                  {value}
                </a>
              </div>
            </div>
          ))}

          {WHATSAPP && (
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hi, I need help with my order`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          )}

          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Business Hours</p>
            <p>Monday – Saturday</p>
            <p>10:00 AM – 7:00 PM IST</p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-1">Message Received!</h2>
              <p className="text-sm text-gray-500">We&apos;ll respond within 24 business hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'name', label: 'Your Name', type: 'text', placeholder: 'Priya Sharma' },
                  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input
                      {...register(f.name as keyof FormData)}
                      type={f.type}
                      placeholder={f.placeholder}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {errors[f.name as keyof FormData] && (
                      <p className="mt-1 text-xs text-error">{errors[f.name as keyof FormData]?.message as string}</p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  {...register('subject')}
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.subject && <p className="mt-1 text-xs text-error">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder="Describe your issue or question…"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
                {errors.message && <p className="mt-1 text-xs text-error">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
