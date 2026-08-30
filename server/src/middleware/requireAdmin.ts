import { Request, Response, NextFunction } from 'express';

/**
 * Must run AFTER requireAuth. Rejects any request whose JWT role is not 'admin'.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  return next();
}
