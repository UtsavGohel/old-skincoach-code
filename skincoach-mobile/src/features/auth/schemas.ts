import { z } from 'zod';

// docs/14: React Hook Form + Zod for every form, never useState.
export const emailPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type EmailPasswordFormValues = z.infer<typeof emailPasswordSchema>;

export const verificationCodeSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code'),
});
export type VerificationCodeFormValues = z.infer<typeof verificationCodeSchema>;
