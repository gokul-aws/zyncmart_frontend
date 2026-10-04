'use client';

import { createContext, useContext, useId } from 'react';
import { cn } from '@/lib/utils';

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Wiring for a control inside <Field>: id (for the label's htmlFor),
 * aria-describedby (hint + error) and aria-invalid. Explicit props win.
 */
// `aria-required` (not the native attribute), so existing react-hook-form/zod
// validation keeps control instead of the browser's validation popups.
export function useFieldControl(props: { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: React.AriaAttributes['aria-invalid']; 'aria-required'?: React.AriaAttributes['aria-required'] }) {
  const field = useContext(FieldContext);
  return {
    id: props.id ?? field?.id,
    'aria-describedby': cn(field?.describedBy, props['aria-describedby']) || undefined,
    'aria-invalid': props['aria-invalid'] ?? (field?.invalid ? true : undefined),
    'aria-required': props['aria-required'] ?? (field?.required || undefined),
  };
}

export interface FieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
  /** Helper text shown under the control. */
  hint?: React.ReactNode;
  /** Validation message; marks the control invalid. */
  error?: React.ReactNode;
  required?: boolean;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
  /** Extra content on the label row (e.g. a "Forgot password?" link). */
  labelAside?: React.ReactNode;
  /** Use a specific id for the control instead of a generated one. */
  id?: string;
  className?: string;
}

/** Label + control + hint + error, correctly associated for assistive tech. */
export default function Field({ label, children, hint, error, required = false, hideLabel = false, labelAside, id, className }: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = hint && !error ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  return (
    <FieldContext.Provider value={{ id: controlId, describedBy: cn(hintId, errorId) || undefined, invalid: Boolean(error), required }}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className={cn('flex items-center justify-between gap-3', hideLabel && !labelAside && 'sr-only')}>
          <label htmlFor={controlId} className={cn('text-sm font-medium text-foreground', hideLabel && 'sr-only')}>
            {label}
            {required && (
              <span className="text-error" aria-hidden="true">
                {' '}*
              </span>
            )}
          </label>
          {labelAside}
        </div>
        {children}
        {hint && !error && (
          <p id={hintId} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm font-medium text-error">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
