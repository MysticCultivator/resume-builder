import { describe, it, expect } from 'vitest';
import { testAgent, registerAndLogin, registerAndLoginAsAdmin } from './helpers';

describe('admin — users', () => {
  it('supports search, role filter, sort, and pagination', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminsearch', email: 'adminsearch@example.com' });
    await registerAndLogin({ username: 'zeta', full_name: 'Zeta Zephyr', email: 'zeta@example.com' });
    await registerAndLogin({ username: 'alpha', full_name: 'Alpha Aaronson', email: 'alpha@example.com' });

    const search = await agent.get('/api/admin/users').query({ search: 'zeta' });
    expect(search.status).toBe(200);
    expect(search.body.data.some((u: { username: string }) => u.username === 'zeta')).toBe(true);
    expect(search.body.data.some((u: { username: string }) => u.username === 'alpha')).toBe(false);

    const roleFiltered = await agent.get('/api/admin/users').query({ role: 'admin' });
    expect(roleFiltered.status).toBe(200);
    expect(roleFiltered.body.data.every((u: { role: string }) => u.role === 'admin')).toBe(true);

    const sorted = await agent.get('/api/admin/users').query({ sort: 'name_asc', limit: 100 });
    expect(sorted.status).toBe(200);
    const names = sorted.body.data.map((u: { full_name: string }) => u.full_name);
    expect(names).toEqual([...names].sort());

    const paged = await agent.get('/api/admin/users').query({ page: 1, limit: 1 });
    expect(paged.status).toBe(200);
    expect(paged.body.data.length).toBe(1);
    expect(paged.body.limit).toBe(1);
  });

  it('rejects an unrecognized sort value instead of building unsafe SQL from it', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminsortguard', email: 'adminsortguard@example.com' });
    const res = await agent.get('/api/admin/users').query({ sort: "created_at; DROP TABLE users;" });
    expect(res.status).toBe(400);
  });

  it('returns a single user with a resume count and their resumes, never a password hash', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminviewer', email: 'adminviewer@example.com' });
    const { agent: userAgent, user } = await registerAndLogin({ username: 'viewedu', email: 'viewedu@example.com' });
    await userAgent.post('/api/resumes').send({ title: 'Resume One' });
    await userAgent.post('/api/resumes').send({ title: 'Resume Two' });

    const detail = await agent.get(`/api/admin/users/${user.user_id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.user.resume_count).toBe(2);
    expect(detail.body.user.password_hash).toBeUndefined();

    const resumes = await agent.get(`/api/admin/users/${user.user_id}/resumes`);
    expect(resumes.status).toBe(200);
    expect(resumes.body).toHaveLength(2);
    expect(resumes.body[0]).toHaveProperty('title');
  });

  it("prevents an admin from deleting their own account, enforced on the backend", async () => {
    const { agent, user } = await registerAndLoginAsAdmin({ username: 'selfdelete', email: 'selfdelete@example.com' });

    const res = await agent.delete(`/api/admin/users/${user.user_id}`);
    expect(res.status).toBe(400);

    const stillThere = await agent.get(`/api/admin/users/${user.user_id}`);
    expect(stillThere.status).toBe(200);
  });

  it('lets an admin delete a different user', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'admindeleter', email: 'admindeleter@example.com' });
    const { user } = await registerAndLogin({ username: 'deleteme', email: 'deleteme@example.com' });

    const res = await agent.delete(`/api/admin/users/${user.user_id}`);
    expect(res.status).toBe(200);

    const gone = await agent.get(`/api/admin/users/${user.user_id}`);
    expect(gone.status).toBe(404);
  });

  it('404s for a nonexistent user instead of leaking existence via a different status', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'admin404', email: 'admin404@example.com' });
    const res = await agent.get('/api/admin/users/999999');
    expect(res.status).toBe(404);
  });
});

describe('admin — resumes', () => {
  it('lists resumes across all users with owner + template info, and supports search/sort/pagination', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminresumes', email: 'adminresumes@example.com' });
    const { agent: ownerAgent } = await registerAndLogin({ username: 'resumeowner', email: 'resumeowner@example.com' });
    await ownerAgent.post('/api/resumes').send({ title: 'Backend Engineer Resume' });
    await ownerAgent.post('/api/resumes').send({ title: 'Frontend Engineer Resume' });

    const list = await agent.get('/api/admin/resumes').query({ search: 'Backend' });
    expect(list.status).toBe(200);
    expect(list.body.data.some((r: { title: string }) => r.title === 'Backend Engineer Resume')).toBe(true);
    expect(list.body.data.every((r: { title: string }) => r.title !== 'Frontend Engineer Resume')).toBe(true);
    expect(list.body.data[0]).toHaveProperty('owner_username');

    const sorted = await agent.get('/api/admin/resumes').query({ sort: 'title_asc', limit: 100 });
    expect(sorted.status).toBe(200);
    const titles = sorted.body.data.map((r: { title: string }) => r.title);
    expect(titles).toEqual([...titles].sort());
  });

  it('lets an admin view any resume read-only, including sub-sections, without owning it', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminresumeviewer', email: 'adminresumeviewer@example.com' });
    const { agent: ownerAgent } = await registerAndLogin({ username: 'resumeowner2', email: 'resumeowner2@example.com' });
    const createRes = await ownerAgent.post('/api/resumes').send({ title: 'Viewable Resume' });
    const resumeId = createRes.body.resume.resume_id;
    await ownerAgent.post('/api/education').send({ resume_id: resumeId, institution_name: 'State University', degree: 'BSc' });

    const view = await agent.get(`/api/admin/resumes/${resumeId}`);
    expect(view.status).toBe(200);
    expect(view.body.resume.title).toBe('Viewable Resume');
    expect(view.body.owner.username).toBe('resumeowner2');
    expect(view.body.owner.password_hash).toBeUndefined();
    expect(Array.isArray(view.body.education)).toBe(true);
  });

  it('lets an admin delete any resume', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminresumedeleter', email: 'adminresumedeleter@example.com' });
    const { agent: ownerAgent } = await registerAndLogin({ username: 'resumeowner3', email: 'resumeowner3@example.com' });
    const createRes = await ownerAgent.post('/api/resumes').send({ title: 'Doomed Resume' });
    const resumeId = createRes.body.resume.resume_id;

    const del = await agent.delete(`/api/admin/resumes/${resumeId}`);
    expect(del.status).toBe(200);

    const gone = await agent.get(`/api/admin/resumes/${resumeId}`);
    expect(gone.status).toBe(404);
  });

  it('a normal user cannot reach any admin resume endpoint', async () => {
    const { agent } = await registerAndLogin({ username: 'normalresumeuser', email: 'normalresumeuser@example.com' });
    expect((await agent.get('/api/admin/resumes')).status).toBe(403);
    expect((await agent.get('/api/admin/resumes/1')).status).toBe(403);
    expect((await agent.delete('/api/admin/resumes/1')).status).toBe(403);
  });
});

describe('admin — statistics, template usage, and export', () => {
  it('returns extended statistics with time-window breakdowns, computed from the database', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminstats', email: 'adminstats@example.com' });
    const res = await agent.get('/api/admin/statistics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users_today');
    expect(res.body).toHaveProperty('users_last_7_days');
    expect(res.body).toHaveProperty('users_last_30_days');
    expect(res.body).toHaveProperty('resumes_today');
    expect(res.body).toHaveProperty('avg_resumes_per_user');
    expect(typeof res.body.avg_resumes_per_user).toBe('number');
  });

  it('computes template usage counts and percentages that sum sensibly', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'admintemplateusage', email: 'admintemplateusage@example.com' });
    const { agent: ownerAgent } = await registerAndLogin({ username: 'templateuser', email: 'templateuser@example.com' });

    // The templates table is truncated before every test (see tests/setup.ts),
    // so — matching the pattern in authorization.test.ts — a built-in
    // template has to be created through the real admin API first.
    const created = await agent.post('/api/templates').send({ template_name: 'Classic' });
    const classicId = created.body.template.template_id;
    await ownerAgent.post('/api/resumes').send({ title: 'Uses Classic', template_id: classicId });

    const usage = await agent.get('/api/admin/template-usage');
    expect(usage.status).toBe(200);
    const classicUsage = usage.body.find((row: { template_name: string }) => row.template_name === 'Classic');
    expect(classicUsage.resume_count).toBeGreaterThanOrEqual(1);
    expect(classicUsage.percentage).toBeGreaterThan(0);
  });

  it('exports users, resumes, and template usage as CSV without leaking password hashes', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminexporter', email: 'adminexporter@example.com' });
    const { agent: ownerAgent } = await registerAndLogin({ username: 'exportowner', email: 'exportowner@example.com' });
    await ownerAgent.post('/api/resumes').send({ title: 'Exported Resume' });

    const usersCsv = await agent.get('/api/admin/export/users');
    expect(usersCsv.status).toBe(200);
    expect(usersCsv.headers['content-type']).toMatch(/text\/csv/);
    expect(usersCsv.text).toMatch(/^ID,Username,Name,Email,Role,Resume Count,Created At/);
    expect(usersCsv.text).not.toMatch(/password/i);

    const resumesCsv = await agent.get('/api/admin/export/resumes');
    expect(resumesCsv.status).toBe(200);
    expect(resumesCsv.text).toMatch(/^Resume ID,Resume Title,User ID,Username,Email,Template,Color,Created At,Updated At/);
    expect(resumesCsv.text).toMatch(/Exported Resume/);

    const templatesCsv = await agent.get('/api/admin/export/templates');
    expect(templatesCsv.status).toBe(200);
    expect(templatesCsv.text).toMatch(/^Template,Resume Count,Usage Percentage/);
  });

  it('a normal user cannot reach statistics, template-usage, or export endpoints', async () => {
    const { agent } = await registerAndLogin({ username: 'normalstatsuser', email: 'normalstatsuser@example.com' });
    expect((await agent.get('/api/admin/statistics')).status).toBe(403);
    expect((await agent.get('/api/admin/template-usage')).status).toBe(403);
    expect((await agent.get('/api/admin/export/users')).status).toBe(403);
  });
});

describe('admin — empty database', () => {
  it('handles statistics and template usage gracefully with no data', async () => {
    const { agent } = await registerAndLoginAsAdmin({ username: 'adminempty', email: 'adminempty@example.com' });
    // The admin account itself is the only row that must exist — assert the
    // endpoints don't throw/500 and return sane zeroed-out numbers rather
    // than assuming a literal empty table (registering the admin adds one
    // user row, which is unavoidable to authenticate at all).
    const stats = await agent.get('/api/admin/statistics');
    expect(stats.status).toBe(200);
    expect(stats.body.total_resumes).toBe(0);
    expect(stats.body.avg_resumes_per_user).toBe(0);
    expect(stats.body.most_used_template).toBeNull();

    const usage = await agent.get('/api/admin/template-usage');
    expect(usage.status).toBe(200);
    expect(usage.body.every((row: { percentage: number }) => row.percentage === 0)).toBe(true);
  });
});
