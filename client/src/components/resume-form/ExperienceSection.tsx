import React, { useState, useRef, FormEvent } from 'react';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { Experience } from '../../types/experience';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { EmptySectionState } from '../shared/EmptySectionState';

const EMPTY_FORM = {
  company_name: '',
  job_title: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
};

type FieldErrors = { company_name?: string; job_title?: string };

export function ExperienceSection() {
  const { draft, addExperience, updateExperienceEntry, removeExperience } = useResumeBuilder();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const companyRef = useRef<HTMLInputElement>(null);

  function startEdit(exp: Experience) {
    setEditingId(exp.experience_id);
    setForm({
      company_name: exp.company_name,
      job_title: exp.job_title,
      start_date: exp.start_date ?? '',
      end_date: exp.end_date ?? '',
      is_current: exp.is_current,
      description: exp.description ?? '',
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
    if (!form.company_name.trim()) nextErrors.company_name = 'Company is required.';
    if (!form.job_title.trim()) nextErrors.job_title = 'Job title is required.';
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      companyRef.current?.focus();
      return;
    }
    setFieldErrors({});
    setError(null);
    setSubmitting(true);
    try {
      // If marked as current, the end date is meaningless — clear it before saving.
      const payload = { ...form, end_date: form.is_current ? '' : form.end_date };
      if (editingId) {
        await updateExperienceEntry(editingId, payload);
      } else {
        await addExperience(payload);
      }
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save experience entry');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await removeExperience(pendingDeleteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete experience entry');
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
        <Input
          ref={companyRef}
          label="Company"
          placeholder="e.g. Acme Corp"
          value={form.company_name}
          onChange={(e) => {
            setForm({ ...form, company_name: e.target.value });
            if (fieldErrors.company_name) setFieldErrors((prev) => ({ ...prev, company_name: undefined }));
          }}
          error={fieldErrors.company_name}
          required
        />
        <Input
          label="Job title"
          placeholder="e.g. Software Engineer"
          value={form.job_title}
          onChange={(e) => {
            setForm({ ...form, job_title: e.target.value });
            if (fieldErrors.job_title) setFieldErrors((prev) => ({ ...prev, job_title: undefined }));
          }}
          error={fieldErrors.job_title}
          required
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Start date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <Input
            label="End date"
            type="date"
            value={form.end_date}
            disabled={form.is_current}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_current}
            onChange={(e) => setForm({ ...form, is_current: e.target.checked, end_date: e.target.checked ? '' : form.end_date })}
          />
          I currently work here
        </label>
        <div className="flex flex-col gap-1">
          <label htmlFor="exp_description" className="text-sm font-medium text-gray-700">
            Responsibilities
          </label>
          <textarea
            id="exp_description"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows={3}
            placeholder="e.g. Led a team of 4 engineers to ship the new checkout flow, reducing cart abandonment by 15%."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : editingId ? 'Update experience' : 'Add experience'}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {draft.experience.length === 0 ? (
        <EmptySectionState
          message="No experience added yet."
          actionLabel="+ Add your first experience entry"
          onAction={() => companyRef.current?.focus()}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {draft.experience.map((exp) => (
            <li key={exp.experience_id} className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-sm">
              <div>
                <p className="font-medium">{exp.job_title} · {exp.company_name}</p>
                {exp.is_current && <p className="text-xs text-primary-600">Current position</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(exp)} className="text-primary-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => setPendingDeleteId(exp.experience_id)} className="text-danger-500 hover:text-danger-700">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        message="Remove this experience entry? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
