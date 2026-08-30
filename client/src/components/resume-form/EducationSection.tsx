import React, { useState, useRef, FormEvent } from 'react';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { Education, EducationLevel } from '../../types/education';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { EmptySectionState } from '../shared/EmptySectionState';

const EMPTY_FORM = {
  institution_name: '',
  degree: '',
  field_of_study: '',
  start_date: '',
  end_date: '',
  gpa: '',
  education_level: 'degree' as EducationLevel,
};

export function EducationSection() {
  const { draft, addEducation, updateEducationEntry, removeEducation } = useResumeBuilder();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ institution_name?: string }>({});
  const institutionRef = useRef<HTMLInputElement>(null);

  function startEdit(edu: Education) {
    setEditingId(edu.education_id);
    setForm({
      institution_name: edu.institution_name,
      degree: edu.degree ?? '',
      field_of_study: edu.field_of_study ?? '',
      start_date: edu.start_date ?? '',
      end_date: edu.end_date ?? '',
      gpa: edu.gpa ?? '',
      education_level: edu.education_level ?? 'degree',
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
    if (!form.institution_name.trim()) {
      setFieldErrors({ institution_name: 'Institution name is required.' });
      institutionRef.current?.focus();
      return;
    }
    setFieldErrors({});
    setError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await updateEducationEntry(editingId, form);
      } else {
        await addEducation(form);
      }
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save education entry');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await removeEducation(pendingDeleteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete education entry');
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
        <Input
          ref={institutionRef}
          label="Institution"
          placeholder="e.g. University of Pune"
          value={form.institution_name}
          onChange={(e) => {
            setForm({ ...form, institution_name: e.target.value });
            if (fieldErrors.institution_name) setFieldErrors({});
          }}
          error={fieldErrors.institution_name}
          required
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="education_level" className="text-sm font-medium text-gray-700">
            Education level
          </label>
          <select
            id="education_level"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={form.education_level}
            onChange={(e) => setForm({ ...form, education_level: e.target.value as EducationLevel })}
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="higher_secondary">Higher Secondary</option>
            <option value="degree">Degree</option>
          </select>
        </div>
        <Input
          label="Degree"
          placeholder="e.g. Bachelor of Science"
          value={form.degree}
          onChange={(e) => setForm({ ...form, degree: e.target.value })}
        />
        <Input
          label="Field of study"
          placeholder="e.g. Computer Science"
          value={form.field_of_study}
          onChange={(e) => setForm({ ...form, field_of_study: e.target.value })}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
          <Input
            label="End date"
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
        <Input
          label="GPA"
          placeholder="e.g. 3.7"
          value={form.gpa}
          onChange={(e) => setForm({ ...form, gpa: e.target.value })}
        />
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : editingId ? 'Update education' : 'Add education'}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {draft.education.length === 0 ? (
        <EmptySectionState
          message="No education entries added yet."
          actionLabel="+ Add your first education entry"
          onAction={() => institutionRef.current?.focus()}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {draft.education.map((edu) => (
            <li key={edu.education_id} className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-sm">
              <div>
                <p className="font-medium">{edu.institution_name}</p>
                <p className="text-gray-500">
                  {edu.degree}
                  {edu.field_of_study ? `, ${edu.field_of_study}` : ''}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(edu)} className="text-primary-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => setPendingDeleteId(edu.education_id)} className="text-danger-500 hover:text-danger-700">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        message="Remove this education entry? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
