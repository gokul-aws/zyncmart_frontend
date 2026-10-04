'use client';

import { useId, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  /** Accessible name of the tab list. */
  label: string;
  className?: string;
}

/**
 * WAI-ARIA tabs: arrow keys / Home / End move between tabs (roving tabindex),
 * each tab controls a labelled panel. Controlled, so callers can open a tab
 * from elsewhere (e.g. a "Read reviews" link).
 */
export default function Tabs({ items, active, onChange, label, className }: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (index: number) => {
    const next = (index + items.length) % items.length;
    onChange(items[next].key);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') focusTab(index + 1);
    else if (e.key === 'ArrowLeft') focusTab(index - 1);
    else if (e.key === 'Home') focusTab(0);
    else if (e.key === 'End') focusTab(items.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-border">
        {items.map((item, i) => {
          const selected = item.key === active;
          return (
            <button
              key={item.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                '-mb-px h-12 shrink-0 border-b-2 px-4 text-sm font-semibold transition-colors',
                selected ? 'border-ink text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.key}
          role="tabpanel"
          id={`${baseId}-panel-${item.key}`}
          aria-labelledby={`${baseId}-tab-${item.key}`}
          hidden={item.key !== active}
          tabIndex={0}
          className="py-6 focus-visible:outline-offset-4"
        >
          {item.key === active && item.content}
        </div>
      ))}
    </div>
  );
}
