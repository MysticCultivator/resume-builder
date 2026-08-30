import React, { useState, useRef, FormEvent } from 'react';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { Achievement } from '../../types/achievement';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { EmptySectionState } from '../shared/EmptySectionState';

const EMPTY_FORM = { title: '', description: '', achieved_date: '' };

export function AchievementSection() {
  const { draft, addAchievement, updateAchievementEntry, removeAchievement } = useResumeBuilder();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const titleRef = useRef<HTMLInputElement>(null);

  function startEdit(ach: Achievement) {
    setEditingId(ach.achievement_id);
    setForm({
      title: ach.title,
      description: ach.description ?? '',
      achieved_date: ach.achieved_date ?? '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setTitleError(undefined);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setTitleError('Title is required.');
      titleRef.current?.focus();
      return;
    }
    setTitleError(undefined);
    setError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await updateAchievementEntry(editingId, form);
      } else {
        await addAchievement(form);
      }
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save achievement');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await removeAchievement(pendingDeleteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete achievement');
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
        <Input
          ref={titleRef}
          label="Title"
          placeholder="e.g. Employee of the Year"
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value });
            if (titleError) setTitleError(undefined);
          }}
          error={titleError}
          required
        />
        <Input label="Date" type="date" value={form.achieved_date} onChange={(e) => setForm({ ...form, achieved_date: e.target.value })} />
        <div className="flex flex-col gap-1">
          <label htmlFor="ach_description" className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="ach_description"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows={2}
            placeholder="What was the achievement, and why did it matter?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : editingId ? 'Update achievement' : 'Add achievement'}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {draft.achievements.length === 0 ? (
        <EmptySectionState
          message="No achievements added yet."
          actionLabel="+ Add your first achievement"
          onAction={() => titleRef.current?.focus()}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {draft.achievements.map((ach) => (
            <li key={ach.achievement_id} className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-sm">
              <p className="font-medium">{ach.title}</p>
              <div className="flex gap-3">
                <button onClick={() => startEdit(ach)} className="text-primary-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => setPendingDeleteId(ach.achievement_id)} className="text-danger-500 hover:text-danger-700">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        message="Remove this achievement? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
