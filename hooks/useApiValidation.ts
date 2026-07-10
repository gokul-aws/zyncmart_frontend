import { useState, useCallback } from 'react';
import { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { toast } from 'sonner';
import axios from 'axios';

export interface ValidationErrorDetail {
  field?: string;
  path?: string;
  message?: string;
  msg?: string;
}

export interface ValidationErrorResponse {
  success?: boolean;
  error?: string | { message?: string };
  message?: string | string[];
  details?: ValidationErrorDetail[];
  errors?: ValidationErrorDetail[];
}

export function useApiValidation<TFieldValues extends FieldValues>() {
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const clearErrors = useCallback(() => {
    setApiErrors({});
    setGeneralError(null);
  }, []);

  const clearFieldError = useCallback((field: keyof TFieldValues) => {
    setApiErrors((prev) => {
      const fieldStr = field as string;
      if (!prev[fieldStr]) return prev;
      const next = { ...prev };
      delete next[fieldStr];
      return next;
    });
  }, []);

  const handleApiError = useCallback(
    (err: unknown, setError?: UseFormSetError<TFieldValues>) => {
      clearErrors();

      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ValidationErrorResponse | undefined;

        if (data && typeof data === 'object') {
          // 1. Check for standard details/errors array (Zod style)
          const details = data.details || data.errors;
          if (Array.isArray(details) && details.length > 0) {
            const grouped: Record<string, string[]> = {};
            
            details.forEach((detail) => {
              const fieldName = detail.field || detail.path || '';
              const message = detail.message || detail.msg || '';
              if (fieldName && message) {
                if (!grouped[fieldName]) {
                  grouped[fieldName] = [];
                }
                if (!grouped[fieldName].includes(message)) {
                  grouped[fieldName].push(message);
                }
              }
            });

            if (Object.keys(grouped).length > 0) {
              setApiErrors(grouped);

              if (setError) {
                Object.entries(grouped).forEach(([field, messages]) => {
                  setError(field as Path<TFieldValues>, {
                    type: 'server',
                    message: messages[0] || 'Validation failed',
                  });
                });
              }
              return;
            }
          }

          // 2. Check for NestJS style array of messages in data.message
          // e.g. "message": ["password: must contain at least one uppercase letter"]
          if (Array.isArray(data.message)) {
            const grouped: Record<string, string[]> = {};
            data.message.forEach((msg) => {
              if (typeof msg === 'string') {
                const parts = msg.split(':');
                if (parts.length > 1) {
                  const fieldName = parts[0].trim().toLowerCase();
                  const message = parts.slice(1).join(':').trim();
                  if (['name', 'email', 'phone', 'password', 'confirmpassword'].includes(fieldName)) {
                    const normalizedField = fieldName === 'confirmpassword' ? 'confirmPassword' : fieldName;
                    if (!grouped[normalizedField]) {
                      grouped[normalizedField] = [];
                    }
                    grouped[normalizedField].push(message);
                    return;
                  }
                }
              }
            });

            if (Object.keys(grouped).length > 0) {
              setApiErrors(grouped);
              return;
            }
          }

          // 3. Check for general data.error
          if (data.error) {
            const errorMsg = typeof data.error === 'string'
              ? data.error
              : data.error.message || 'Validation failed';
            setGeneralError(errorMsg);
            toast.error(errorMsg);
            return;
          }

          // 4. Check for general data.message
          if (data.message && typeof data.message === 'string') {
            setGeneralError(data.message);
            toast.error(data.message);
            return;
          }
        }

        // 5. Fallback for raw text response
        const rawData = err.response?.data;
        if (typeof rawData === 'string' && rawData.trim() !== '') {
          setGeneralError(rawData);
          toast.error(rawData);
          return;
        }
      }

      const defaultMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setGeneralError(defaultMsg);
      toast.error(defaultMsg);
    },
    [clearErrors]
  );

  return {
    apiErrors,
    generalError,
    handleApiError,
    clearErrors,
    clearFieldError,
    setApiErrors,
    setGeneralError,
  };
}
