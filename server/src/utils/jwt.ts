import jwt, { SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  user_id: number;
  role: 'user' | 'admin';
}

// JWT_SECRET must come from the environment — never hard-code a secret in
// source. A weak, well-known fallback is only tolerated outside production
// (local dev convenience); production startup fails loudly instead of
// silently signing tokens with a guessable secret.
const configuredSecret = process.env.JWT_SECRET;
if (!configuredSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable must be set in production');
}
const JWT_SECRET = configuredSecret || 'dev_secret_change_me';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1d') as SignOptions['expiresIn'];

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
