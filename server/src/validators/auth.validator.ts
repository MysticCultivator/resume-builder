import { z } from 'zod';

// Alphanumeric + underscore, matching a typical "username" convention.
const usernamePattern = /^[a-zA-Z0-9_]+$/;

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(usernamePattern, 'Username may only contain letters, numbers, and underscores'),
  full_name: z.string().trim().min(2).max(100),
  // Normalized to lowercase here so every downstream consumer (uniqueness
  // checks, storage, lookups) sees the same canonical form.
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(6).max(100),
});

// Login accepts a single "username or email" field. We don't validate its
// shape as strictly as a real email/username here — the repository layer
// auto-detects which one it is — but we do trim it and enforce a sane
// length so obviously-malformed input is rejected before it reaches the DB.
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Username or email is required')
    .max(255, 'Username or email is too long'),
  password: z.string().min(1, 'Password is required'),
});
