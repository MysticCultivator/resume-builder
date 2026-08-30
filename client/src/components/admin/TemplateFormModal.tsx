import React, { useEffect, useState } from 'react';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { Template } from '../../types/template';
import { templateService } from '../../services/templateService';
import { BUILT_IN_TEMPLATE_NAMES } from '../../templates';

interface TemplateFormModalProps {
  open: boolean;
  /** Present to edit an existing template, absent to create a new one. */
  template?: Template | null;
  /** Names already used by an existing row — offered as a create option
   *  only if not already taken (avoids duplicate built-in rows). */
  existingNames?: string[];
  onClose: () => void;
  /** Called with the created/updated template once the save succeeds. */
  onSaved: (template: Template) => void;
}

/**
 * Admin "Add template" / "Edit template" form (Part 4 §4). Reuses the
 * existing template CRUD endpoints (POST/PUT /api/templates) — no new
 * backend routes were needed, since template create/update/delete already
 * existed server-side and were only missing from the admin UI.
 */
export function TemplateFormModal({ open, template, existingNames = [], onClose, onSaved }: TemplateFormModalProps) {
  const isEdit = Boolean(template);
  // A built-in template's name is how the renderer finds it — it can't be
  // changed once created (Part 3 §13). Non-built-in rows shouldn't exist
  // under the current create restriction, but if one is somehow present
  // (e.g. from before this fix), still allow editing its thumbnail.
  const isBuiltIn = Boolean(template && BUILT_IN_TEMPLATE_NAMES.includes(template.template_name));
  const [name, setName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The app only has renderers for the four built-in designs (see
  // ../../templates/index.ts), so creating a template with any other name
  // would silently render as Classic (Part 3 §14). Offer only the names
  // that don't already have a row.
  const availableNames = BUILT_IN_TEMPLATE_NAMES.filter((n) => !existingNames.includes(n));

  // Reset the form each time the modal is opened, for either a fresh
  // "create" or to load the selected template's current values for "edit".
  useEffect(() => {
    if (!open) return;
    setName(template?.template_name ?? availableNames[0] ?? '');
    setThumbnailUrl(template?.thumbnail_url ?? '');
    setError(null);
    // availableNames is derived from props each render; only re-run this
    // reset when the modal opens or the template being edited changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, template]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Template name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { template_name: name.trim(), thumbnail_url: thumbnailUrl.trim() || undefined };
      const { template: saved } = isEdit
        ? await templateService.update(template!.template_id, payload)
        : await templateService.create(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={isEdit ? 'Edit template' : 'Add template'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isEdit ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-800">Template name</span>
            <Input value={name} disabled aria-label="Template name" />
            {isBuiltIn && (
              <p className="text-xs text-gray-500">
                Built-in templates can't be renamed — the resume renderer looks them up by this exact name.
              </p>
            )}
          </div>
        ) : availableNames.length > 0 ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="template-name" className="text-sm font-medium text-gray-800">
              Template name
            </label>
            <select
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            >
              {availableNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Only the app's built-in resume layouts can be added — there's no renderer for a custom name yet.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            All built-in templates ({BUILT_IN_TEMPLATE_NAMES.join(', ')}) already exist. Edit an existing one instead.
          </p>
        )}
        <Input
          label="Thumbnail URL (optional)"
          type="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://example.com/thumbnail.png"
        />
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!isEdit && availableNames.length === 0}>
            {isEdit ? 'Save changes' : 'Add template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
