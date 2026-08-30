import { describe, it, expect } from 'vitest';
import { testAgent, registerAndLogin, registerAndLoginAsAdmin } from './helpers';

describe('resume ownership', () => {
  it('lets a user access their own resume', async () => {
    const { agent } = await registerAndLogin({ username: 'owner', email: 'owner@example.com' });

    const createRes = await agent.post('/api/resumes').send({ title: 'My Resume' });
    expect(createRes.status).toBe(201);
    const resumeId = createRes.body.resume.resume_id;

    const getRes = await agent.get(`/api/resumes/${resumeId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.resume.resume_id).toBe(resumeId);
  });

  it("prevents a user from accessing another user's resume", async () => {
    const { agent: ownerAgent } = await registerAndLogin({ username: 'owner2', email: 'owner2@example.com' });
    const { agent: intruderAgent } = await registerAndLogin({ username: 'intruder', email: 'intruder@example.com' });

    const createRes = await ownerAgent.post('/api/resumes').send({ title: 'Private Resume' });
    const resumeId = createRes.body.resume.resume_id;

    const getRes = await intruderAgent.get(`/api/resumes/${resumeId}`);
    expect(getRes.status).toBe(404); // 404, not 403, so ownership isn't leaked

    const updateRes = await intruderAgent.put(`/api/resumes/${resumeId}`).send({ title: 'Hijacked' });
    expect(updateRes.status).toBe(404);

    const deleteRes = await intruderAgent.delete(`/api/resumes/${resumeId}`);
    expect(deleteRes.status).toBe(404);
  });
});

describe('admin authorization', () => {
  it('rejects a normal user from admin-only endpoints', async () => {
    const { agent } = await registerAndLogin({ username: 'normaluser', email: 'normaluser@example.com' });

    const res = await agent.get('/api/admin/users');
    expect(res.status).toBe(403);
  });

  it('allows an admin to access admin-only endpoints, including updating a template against the live schema', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminuser', email: 'adminuser@example.com' });

    // GET /api/admin/users now returns a paginated envelope ({ data, total,
    // page, limit }) rather than a bare array, so the admin Users page can
    // page through large user lists server-side.
    const usersRes = await agent.get('/api/admin/users');
    expect(usersRes.status).toBe(200);
    expect(Array.isArray(usersRes.body.data)).toBe(true);
    expect(typeof usersRes.body.total).toBe('number');

    const statsRes = await agent.get('/api/admin/statistics');
    expect(statsRes.status).toBe(200);
    expect(statsRes.body).toHaveProperty('total_users');

    // Also exercises POST/PUT /api/templates/:id end-to-end against the
    // real `templates` table (which has no created_at/updated_at columns)
    // — a direct regression check for a real bug where the repository
    // previously tried to set a non-existent `updated_at` column on every
    // template update. Template creation is restricted to the app's
    // built-in, code-backed layout names (Part 3 §14 — see
    // server/src/utils/builtinTemplates.ts), so "Classic" is used here
    // instead of an arbitrary name; the tests table is truncated before
    // each test, so it doesn't already exist.
    const created = await agent.post('/api/templates').send({ template_name: 'Classic' });
    expect(created.status).toBe(201);
    const templateId = created.body.template.template_id;

    const updated = await agent
      .put(`/api/templates/${templateId}`)
      .send({ thumbnail_url: 'https://example.com/classic-thumb.png' });
    expect(updated.status).toBe(200);
    expect(updated.body.template.thumbnail_url).toBe('https://example.com/classic-thumb.png');
  });

  it('protects built-in templates from being renamed, deleted, or shadowed by an unrenderable name', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminuser2', email: 'adminuser2@example.com' });

    // Creating a template with no matching renderer is rejected outright
    // (Part 3 §14) — it would otherwise silently render as Classic.
    const badCreate = await agent.post('/api/templates').send({ template_name: 'Professional Blue' });
    expect(badCreate.status).toBe(400);

    const created = await agent.post('/api/templates').send({ template_name: 'Modern' });
    expect(created.status).toBe(201);
    const templateId = created.body.template.template_id;

    // Renaming a built-in template would break resolveTemplate() for every
    // resume that has it selected (Part 3 §13).
    const renamed = await agent.put(`/api/templates/${templateId}`).send({ template_name: 'My Modern Resume' });
    expect(renamed.status).toBe(400);

    // Deleting it would do the same.
    const deleted = await agent.delete(`/api/templates/${templateId}`);
    expect(deleted.status).toBe(400);

    const stillThere = await agent.get(`/api/templates/${templateId}`);
    expect(stillThere.status).toBe(200);
    expect(stillThere.body.template.template_name).toBe('Modern');
  });

  it('rejects admin routes with no authentication at all', async () => {
    const res = await testAgent().get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});
