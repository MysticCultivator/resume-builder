import { pool } from '../config/db';

export interface UserRow {
  user_id: number;
  full_name: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export const userRepository = {
  // Email lookups are case-insensitive. Combined with normalizing email to
  // lowercase before it's ever stored (see auth.service.ts), this means
  // "John@Example.com" and "john@example.com" are always treated as the
  // same account.
  async findByEmail(email: string): Promise<UserRow | null> {
    const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return rows[0] ?? null;
  },

  // Usernames are stored with their original casing (so a user's chosen
  // capitalization is preserved for display) but looked up and enforced as
  // unique case-insensitively, so "Jane" and "jane" can't both be taken and
  // a user can log in regardless of how they capitalize their own username.
  async findByUsername(username: string): Promise<UserRow | null> {
    const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    return rows[0] ?? null;
  },

  /**
   * Looks a user up by either username or email, auto-detecting which one
   * `identifier` is (an email always contains '@'; a username never does,
   * per the existing username validation pattern). Used by login so a
   * single "Username or Email" field can resolve to the right account.
   */
  async findByIdentifier(identifier: string): Promise<UserRow | null> {
    const trimmed = identifier.trim();
    if (trimmed.includes('@')) {
      return this.findByEmail(trimmed);
    }
    return this.findByUsername(trimmed);
  },

  async findById(userId: number): Promise<UserRow | null> {
    const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE user_id = $1', [userId]);
    return rows[0] ?? null;
  },

  async create(fullName: string, username: string, email: string, passwordHash: string): Promise<UserRow> {
    // Defense in depth: email is already normalized to lowercase in
    // auth.service.ts (the source of truth for that decision), but we
    // lowercase again here so the invariant holds even if this repository
    // method is ever called directly from somewhere else.
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (full_name, username, email, password_hash)
       VALUES ($1, $2, LOWER($3), $4) RETURNING *`,
      [fullName, username, email, passwordHash]
    );
    return rows[0];
  },

  async listAll(): Promise<Omit<UserRow, 'password_hash'>[]> {
    const { rows } = await pool.query(
      'SELECT user_id, full_name, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  async deleteById(userId: number): Promise<void> {
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
  },
};
