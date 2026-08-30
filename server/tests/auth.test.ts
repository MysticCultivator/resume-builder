import { describe, it, expect } from 'vitest';
import { testAgent, registerAndLogin } from './helpers';

describe('POST /api/auth/register', () => {
  it('registers successfully, sets an HttpOnly cookie, and never returns the password hash or a raw token', async () => {
    const res = await testAgent()
      .post('/api/auth/register')
      .send({ username: 'alice', full_name: 'Alice A', email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ username: 'alice', email: 'alice@example.com', role: 'user' });
    expect(res.body.user.password_hash).toBeUndefined();
    expect(res.body.token).toBeUndefined();

    const setCookie = String(res.headers['set-cookie']);
    expect(setCookie).toMatch(/token=/);
    expect(setCookie).toMatch(/HttpOnly/i);
  });

  it('rejects a duplicate username', async () => {
    await testAgent()
      .post('/api/auth/register')
      .send({ username: 'bob', full_name: 'Bob B', email: 'bob1@example.com', password: 'password123' });

    const res = await testAgent()
      .post('/api/auth/register')
      .send({ username: 'bob', full_name: 'Bob Two', email: 'bob2@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username/i);
  });

  it('rejects a duplicate email, case-insensitively', async () => {
    await testAgent()
      .post('/api/auth/register')
      .send({ username: 'carol1', full_name: 'Carol', email: 'carol@example.com', password: 'password123' });

    const res = await testAgent()
      .post('/api/auth/register')
      .send({ username: 'carol2', full_name: 'Carol Two', email: 'CAROL@Example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/i);
  });
});

describe('POST /api/auth/login (username or email)', () => {
  it('logs in with the username', async () => {
    const { input } = await registerAndLogin({ username: 'loginuser', email: 'loginuser@example.com' });

    const res = await testAgent()
      .post('/api/auth/login')
      .send({ identifier: input.username, password: input.password });

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('loginuser');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('logs in with the email, case-insensitively', async () => {
    const { input } = await registerAndLogin({ username: 'loginuser2', email: 'loginuser2@example.com' });

    const res = await testAgent()
      .post('/api/auth/login')
      .send({ identifier: 'LoginUser2@Example.com', password: input.password });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('loginuser2@example.com');
  });

  it('rejects an incorrect password and an unknown identifier with the same generic message', async () => {
    const { input } = await registerAndLogin({ username: 'wrongpass', email: 'wrongpass@example.com' });

    const wrongPasswordRes = await testAgent()
      .post('/api/auth/login')
      .send({ identifier: input.username, password: 'not-the-password' });
    expect(wrongPasswordRes.status).toBe(401);
    expect(wrongPasswordRes.body.error).toBe('Invalid username/email or password.');

    const unknownUserRes = await testAgent()
      .post('/api/auth/login')
      .send({ identifier: 'no-such-user', password: 'whatever123' });
    expect(unknownUserRes.status).toBe(401);
    expect(unknownUserRes.body.error).toBe('Invalid username/email or password.');
  });
});

describe('protected routes and logout', () => {
  it('rejects an unauthenticated request and allows an authenticated one', async () => {
    const anonRes = await testAgent().get('/api/auth/me');
    expect(anonRes.status).toBe(401);

    const { agent, user } = await registerAndLogin({ username: 'meuser', email: 'meuser@example.com' });
    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user.user_id).toBe(user.user_id);
  });

  it('logout clears the auth cookie and protected routes stop working afterward', async () => {
    const { agent } = await registerAndLogin({ username: 'logoutuser', email: 'logoutuser@example.com' });
    expect((await agent.get('/api/auth/me')).status).toBe(200);

    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
    expect(String(logoutRes.headers['set-cookie'])).toMatch(/token=;/);

    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });
});
