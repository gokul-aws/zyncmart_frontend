import { z } from 'zod';

// Mirrors the backend's password policy (zyncmart_backend/src/utils/validators/auth.js
// passwordSchema) so invalid passwords are caught client-side instead of round-tripping
// to the server on submit.
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)');
