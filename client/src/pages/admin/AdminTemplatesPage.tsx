import React, { useEffect, useState } from 'react';
import { Template } from '../../types/template';
import { TemplateUsage } from '../../types/admin';
import { templateService } from '../../services/templateService';
import { adminService } from '../../services/adminService';
import { TemplateTable } from '../../components/admin/TemplateTable';
import { TemplateFormModal } from '../../components/admin/TemplateFormModal';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Button } from '../../components/shared/Button';
import { BUILT_IN_TEMPLATE_NAMES } from '../../templates';

export function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [usage, setUsage] = useState<TemplateUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  function refresh() {
    setLoading(true);
    setError(null);
    Promise.all([templateService.list(), adminService.templateUsage()])
      .then(([templateList, usageList]) => {
        setTemplates(templateList);
        setUsage(usageList);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load templates'))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await templateService.remove(pendingDeleteId);
      setTemplates((prev) => prev.filter((t) => t.template_id !== pendingDeleteId));
      adminService.templateUsage().then(setUsage).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setPendingDeleteId(null);
    }
  }

  function openCreateForm() {
    setEditingTemplate(null);
    setFormOpen(true);
  }

  function openEditForm(template: Template) {
    setEditingTemplate(template);
    setFormOpen(true);
  }

  function handleSaved(saved: Template) {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.template_id === saved.template_id);
      return exists ? prev.map((t) => (t.template_id === saved.template_id ? saved : t)) : [...prev, saved];
    });
    adminService.templateUsage().then(setUsage).catch(() => undefined);
  }

  if (loading) return <LoadingSpinner label="Loading templates…" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Manage templates</h1>
        <Button onClick={openCreateForm}>Add template</Button>
      </div>
      {error && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-danger-200 bg-danger-50 px-3 py-2">
          <p className="text-sm text-danger-600">{error}</p>
          <button onClick={refresh} className="text-sm font-medium text-danger-700 hover:underline">
            Try again
          </button>
        </div>
      )}
      <TemplateTable
        templates={templates}
        builtInNames={BUILT_IN_TEMPLATE_NAMES}
        usage={usage}
        onDelete={setPendingDeleteId}
        onEdit={openEditForm}
      />
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete template?"
        message="Resumes using this template will fall back to the Classic layout. This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
      <TemplateFormModal
        open={formOpen}
        template={editingTemplate}
        existingNames={templates.map((t) => t.template_name)}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
