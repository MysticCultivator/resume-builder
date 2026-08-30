import { JwtPayload } from '../../utils/jwt';

// Augments Express's Request type so req.user is available after requireAuth runs.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
