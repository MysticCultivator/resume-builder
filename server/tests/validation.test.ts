import { describe, it, expect } from 'vitest';
import { testAgent, registerAndLogin } from './helpers';

describe('validation', () => {
  it('rejects registration with an invalid email or an invalid username', async () => {
    const badEmail = await testAgent()
      .post('/api/auth/register')
      .send({ username: 'valuser1', full_name: 'Val User', email: 'not-an-email', password: 'password123' });
    expect(badEmail.status).toBe(400);

    const badUsername = await testAgent()
      .post('/api/auth/register')
      .send({ username: 'in valid!', full_name: 'Val User', email: 'valuser2@example.com', password: 'password123' });
    expect(badUsername.status).toBe(400);
  });

  it('rejects a malformed login request (missing password)', async () => {
    const res = await testAgent().post('/api/auth/login').send({ identifier: 'someone' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid resume data (empty title)', async () => {
    const { agent } = await registerAndLogin({ username: 'valresume', email: 'valresume@example.com' });
    const res = await agent.post('/api/resumes').send({ title: '' });
    expect(res.status).toBe(400);
  });
});
