import React, { useState, useRef, FormEvent } from 'react';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { Skill, SkillCategory, ProficiencyLevel } from '../../types/skill';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { EmptySectionState } from '../shared/EmptySectionState';

const EMPTY_FORM = { skill_name: '', category: 'technical' as SkillCategory, proficiency_level: 'intermediate' as ProficiencyLevel };

export function SkillSection() {
  const { draft, addSkill, updateSkillEntry, removeSkill } = useResumeBuilder();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const nameRef = useRef<HTMLInputElement>(null);

  function startEdit(skill: Skill) {
    setEditingId(skill.skill_id);
    setForm({
      skill_name: skill.skill_name,
      category: (skill.category as SkillCategory) ?? 'technical',
      proficiency_level: (skill.proficiency_level as ProficiencyLevel) ?? 'intermediate',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setNameError(undefined);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.skill_name.trim()) {
      setNameError('Skill name is required.');
      nameRef.current?.focus();
      return;
    }
    setNameError(undefined);
    setError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await updateSkillEntry(editingId, form);
      } else {
        await addSkill(form);
      }
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save skill');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await removeSkill(pendingDeleteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
        <Input
          ref={nameRef}
          label="Skill name"
          placeholder="e.g. TypeScript"
          value={form.skill_name}
          onChange={(e) => {
            setForm({ ...form, skill_name: e.target.value });
            if (nameError) setNameError(undefined);
          }}
          error={nameError}
          required
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="skill_category" className="text-sm font-medium text-gray-700">Category</label>
            <select
              id="skill_category"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as SkillCategory })}
            >
              <option value="technical">Technical</option>
              <option value="soft">Soft</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="skill_proficiency" className="text-sm font-medium text-gray-700">Proficiency</label>
            <select
              id="skill_proficiency"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={form.proficiency_level}
              onChange={(e) => setForm({ ...form, proficiency_level: e.target.value as ProficiencyLevel })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : editingId ? 'Update skill' : 'Add skill'}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {draft.skills.length === 0 ? (
        <EmptySectionState
          message="No skills added yet."
          actionLabel="+ Add your first skill"
          onAction={() => nameRef.current?.focus()}
        />
      ) : (
        <ul className="flex flex-wrap gap-2">
          {draft.skills.map((skill) => (
            <li key={skill.skill_id} className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs">
              <button onClick={() => startEdit(skill)} className="hover:underline">
                {skill.skill_name} ({skill.proficiency_level})
              </button>
              <button onClick={() => setPendingDeleteId(skill.skill_id)} className="text-danger-500 hover:text-danger-700" aria-label={`Remove ${skill.skill_name}`}>
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        message="Remove this skill? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
