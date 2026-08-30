import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/config/db';

export const testAgent = () => request.agent(app);

interface RegisterInput {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

const DEFAULT_USER: RegisterInput = {
  username: 'testuser',
  full_name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
};

/**
 * Registers a user through the real API (so password hashing, cookie
 * issuance, etc. all go through the real code path) and returns an
 * authenticated supertest agent (cookie jar already populated) plus the
 * created user's data.
 */
export async function registerAndLogin(overrides: Partial<RegisterInput> = {}) {
  const agent = testAgent();
  const input = { ...DEFAULT_USER, ...overrides };

  const res = await agent.post('/api/auth/register').send(input);
  if (res.status !== 201) {
    throw new Error(`registerAndLogin failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return { agent, user: res.body.user, input };
}

/**
 * Registers a user, then promotes them to admin directly via SQL (mirroring
 * the documented "grant admin" flow: UPDATE users SET role = 'admin' ...),
 * then logs in again so the freshly-issued JWT actually carries role=admin
 * — matching the app's real, documented behavior that a role change only
 * takes effect on the next login.
 */
export async function registerAndLoginAsAdmin(overrides: Partial<RegisterInput> = {}) {
  const { user, input } = await registerAndLogin(overrides);
  await pool.query('UPDATE users SET role = $1 WHERE user_id = $2', ['admin', user.user_id]);

  const agent = testAgent();
  const loginRes = await agent
    .post('/api/auth/login')
    .send({ identifier: input.email, password: input.password });
  if (loginRes.status !== 200) {
    throw new Error(`admin re-login failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
  }

  return { agent, user: loginRes.body.user, input };
}
