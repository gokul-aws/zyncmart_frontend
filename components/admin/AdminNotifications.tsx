'use client';

import { Bell, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

const notifications = [
  {
    id: '1',
    title: 'New order received',
    description: 'Order #4591 has just been placed and requires fulfillment.',
    variant: 'success',
  },
  {
    id: '2',
    title: 'Products low in stock',
    description: '3 products are below the reorder threshold.',
    variant: 'warning',
  },
  {
    id: '3',
    title: 'System update available',
    description: 'A new backend release is ready to deploy.',
    variant: 'info',
  },
];

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Bell,
};

export default function AdminNotifications() {
  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm p-6 dark:border-slate-700/80 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review the latest system alerts and recommended actions for your admin panel.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Sparkles className="w-4 h-4" />
            Live updates
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {notifications.map((item) => {
            const Icon = ICONS[item.variant as keyof typeof ICONS];
            return (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700/70 dark:bg-slate-950"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-2xl bg-primary/10 p-2 text-primary dark:bg-primary/15 dark:text-primary-light">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
