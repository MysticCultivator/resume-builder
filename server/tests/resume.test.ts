import { describe, it, expect } from 'vitest';
import { registerAndLogin } from './helpers';

describe('resume CRUD', () => {
  it('creates, retrieves, updates, and deletes a resume', async () => {
    const { agent } = await registerAndLogin({ username: 'cruduser', email: 'cruduser@example.com' });

    const created = await agent.post('/api/resumes').send({ title: 'Software Engineer Resume', summary: 'A summary' });
    expect(created.status).toBe(201);
    const resumeId = created.body.resume.resume_id;

    const getRes = await agent.get(`/api/resumes/${resumeId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.resume.title).toBe('Software Engineer Resume');
    expect(getRes.body).toHaveProperty('education');

    const updateRes = await agent.put(`/api/resumes/${resumeId}`).send({ title: 'Updated Title' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.resume.title).toBe('Updated Title');

    const deleteRes = await agent.delete(`/api/resumes/${resumeId}`);
    expect(deleteRes.status).toBe(200);
    expect((await agent.get(`/api/resumes/${resumeId}`)).status).toBe(404);
  });
});

describe('partial updates and clearing fields (COALESCE regression coverage)', () => {
  it('leaves omitted fields unchanged, and clears a field only when explicitly set to null', async () => {
    const { agent } = await registerAndLogin({ username: 'partialuser', email: 'partialuser@example.com' });
    const created = await agent
      .post('/api/resumes')
      .send({ title: 'Partial Update Test', summary: 'Keep this summary', location: 'Pune' });
    const resumeId = created.body.resume.resume_id;

    // Updating only the title must leave summary/location untouched.
    const titleOnly = await agent.put(`/api/resumes/${resumeId}`).send({ title: 'New Title Only' });
    expect(titleOnly.status).toBe(200);
    expect(titleOnly.body.resume.title).toBe('New Title Only');
    expect(titleOnly.body.resume.summary).toBe('Keep this summary');
    expect(titleOnly.body.resume.location).toBe('Pune');

    // Explicitly clearing summary must null it out while leaving other fields intact.
    const clearSummary = await agent.put(`/api/resumes/${resumeId}`).send({ summary: null });
    expect(clearSummary.status).toBe(200);
    expect(clearSummary.body.resume.summary).toBeNull();
    expect(clearSummary.body.resume.title).toBe('New Title Only');
    expect(clearSummary.body.resume.location).toBe('Pune');
  });

  it('clears a nested section field (education degree) without disturbing sibling fields', async () => {
    const { agent } = await registerAndLogin({ username: 'partialedu', email: 'partialedu@example.com' });
    const resume = await agent.post('/api/resumes').send({ title: 'Education Clear Test' });
    const resumeId = resume.body.resume.resume_id;

    const edu = await agent
      .post(`/api/resumes/${resumeId}/education`)
      .send({ institution_name: 'Test University', degree: 'BSc', field_of_study: 'Computer Science' });
    expect(edu.status).toBe(201);
    const educationId = edu.body.education.education_id;

    const res = await agent.put(`/api/education/${educationId}`).send({ degree: null });
    expect(res.status).toBe(200);
    expect(res.body.education.degree).toBeNull();
    expect(res.body.education.institution_name).toBe('Test University');
    expect(res.body.education.field_of_study).toBe('Computer Science');
  });
});
