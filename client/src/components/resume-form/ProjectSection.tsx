import React, { useState, useRef, FormEvent } from 'react';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { Project } from '../../types/project';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { EmptySectionState } from '../shared/EmptySectionState';

const EMPTY_FORM = { project_name: '', description: '', project_link: '', technologies: '' };

type FieldErrors = { project_name?: string; project_link?: string };

export function ProjectSection() {
  const { draft, addProject, updateProjectEntry, removeProject } = useResumeBuilder();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const nameRef = useRef<HTMLInputElement>(null);

  function startEdit(proj: Project) {
    setEditingId(proj.project_id);
    setForm({
      project_name: proj.project_name,
      description: proj.description ?? '',
      project_link: proj.project_link ?? '',
      technologies: proj.technologies ?? '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!form.project_name.trim()) nextErrors.project_name = 'Project name is required.';
    if (form.project_link && !/^https?:\/\//i.test(form.project_link)) {
      nextErrors.project_link = 'Project link should start with http:// or https://';
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      if (nextErrors.project_name) nameRef.current?.focus();
      return;
    }
    setFieldErrors({});
    setError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await updateProjectEntry(editingId, form);
      } else {
        await addProject(form);
      }
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await removeProject(pendingDeleteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
        <Input
          ref={nameRef}
          label="Project name"
          placeholder="e.g. Resume Builder"
          value={form.project_name}
          onChange={(e) => {
            setForm({ ...form, project_name: e.target.value });
            if (fieldErrors.project_name) setFieldErrors((prev) => ({ ...prev, project_name: undefined }));
          }}
          error={fieldErrors.project_name}
          required
        />
        <Input
          label="Technologies used"
          value={form.technologies}
          onChange={(e) => setForm({ ...form, technologies: e.target.value })}
          placeholder="React, Node.js, PostgreSQL"
        />
        <Input
          label="Project link"
          value={form.project_link}
          onChange={(e) => {
            setForm({ ...form, project_link: e.target.value });
            if (fieldErrors.project_link) setFieldErrors((prev) => ({ ...prev, project_link: undefined }));
          }}
          error={fieldErrors.project_link}
          placeholder="https://github.com/you/project"
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="proj_description" className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="proj_description"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows={3}
            placeholder="What did you build, and what was the impact?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : editingId ? 'Update project' : 'Add project'}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {draft.projects.length === 0 ? (
        <EmptySectionState
          message="No projects added yet."
          actionLabel="+ Add your first project"
          onAction={() => nameRef.current?.focus()}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {draft.projects.map((proj) => (
            <li key={proj.project_id} className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-sm">
              <p className="font-medium">{proj.project_name}</p>
              <div className="flex gap-3">
                <button onClick={() => startEdit(proj)} className="text-primary-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => setPendingDeleteId(proj.project_id)} className="text-danger-500 hover:text-danger-700">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        message="Remove this project? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
