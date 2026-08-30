import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { signToken } from '../utils/jwt';
import { ApiError } from '../middleware/errorHandler';

const SALT_ROUNDS = 10;

// Deliberately generic and identical for "no such account" and "wrong
// password" so a caller can't use the error message to enumerate which
// usernames/emails exist in the system.
const INVALID_CREDENTIALS_MESSAGE = 'Invalid username/email or password.';

export const authService = {
  async register(fullName: string, username: string, email: string, password: string) {
    // email is already lowercased by registerSchema; findByEmail/findByUsername
    // also compare case-insensitively, so this check is safe even if a caller
    // that skips validation passes mixed-case input.
    const [existingByEmail, existingByUsername] = await Promise.all([
      userRepository.findByEmail(email),
      userRepository.findByUsername(username),
    ]);

    if (existingByEmail) {
      throw new ApiError(409, 'An account with this email already exists');
    }
    if (existingByUsername) {
      throw new ApiError(409, 'This username is already taken');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create(fullName, username, email, passwordHash);

    const token = signToken({ user_id: user.user_id, role: user.role });
    return { user: sanitize(user), token };
  },

  /**
   * Logs in with either a username or an email address in `identifier`.
   * Returns the same shape and the same generic error either way, so the
   * response never reveals whether the identifier matched an account.
   */
  async login(identifier: string, password: string) {
    const user = await userRepository.findByIdentifier(identifier);
    if (!user) {
      throw new ApiError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new ApiError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    const token = signToken({ user_id: user.user_id, role: user.role });
    return { user: sanitize(user), token };
  },

  async getProfile(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return sanitize(user);
  },
};

// Strip the password hash before sending a user object back to the client.
function sanitize<T extends { password_hash: string }>(user: T): Omit<T, 'password_hash'> {
  const { password_hash, ...rest } = user;
  return rest;
}
