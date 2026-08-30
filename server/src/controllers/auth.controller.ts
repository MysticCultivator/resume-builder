import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = registerSchema.parse(req.body);
      const { user, token } = await authService.register(body.full_name, body.username, body.email, body.password);
      // The JWT lives only in an HttpOnly cookie — never in the JSON body —
      // so it's inaccessible to JavaScript (and therefore to XSS) on the
      // frontend. The frontend never needs to see the raw token itself.
      setAuthCookie(res, token);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = loginSchema.parse(req.body);
      const { user, token } = await authService.login(body.identifier, body.password);
      setAuthCookie(res, token);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response) {
    // JWTs are stateless, so this doesn't (and can't honestly claim to)
    // revoke the token server-side — but it does clear the HttpOnly cookie
    // that carries it, so the browser stops sending it on subsequent
    // requests and requireAuth has nothing to authenticate with.
    clearAuthCookie(res);
    res.status(200).json({ success: true });
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.user_id);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },
};
