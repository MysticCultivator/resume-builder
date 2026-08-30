import React, { useState, useRef, FormEvent } from 'react';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { Certification } from '../../types/certification';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { EmptySectionState } from '../shared/EmptySectionState';

const EMPTY_FORM = { certification_name: '', issuing_organization: '', issue_date: '', credential_id: '', credential_url: '' };

type FieldErrors = { certification_name?: string; credential_url?: string };

export function CertificationSection() {
  const { draft, addCertification, updateCertificationEntry, removeCertification } = useResumeBuilder();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const nameRef = useRef<HTMLInputElement>(null);

  function startEdit(cert: Certification) {
    setEditingId(cert.certification_id);
    setForm({
      certification_name: cert.certification_name,
      issuing_organization: cert.issuing_organization ?? '',
      issue_date: cert.issue_date ?? '',
      credential_id: cert.credential_id ?? '',
      credential_url: cert.credential_url ?? '',
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
    if (!form.certification_name.trim()) nextErrors.certification_name = 'Certification name is required.';
    if (form.credential_url && !/^https?:\/\//i.test(form.credential_url)) {
      nextErrors.credential_url = 'Credential URL should start with http:// or https://';
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      if (nextErrors.certification_name) nameRef.current?.focus();
      return;
    }
    setFieldErrors({});
    setError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCertificationEntry(editingId, form);
      } else {
        await addCertification(form);
      }
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save certification');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await removeCertification(pendingDeleteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete certification');
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
        <Input
          ref={nameRef}
          label="Certification name"
          placeholder="e.g. AWS Certified Solutions Architect"
          value={form.certification_name}
          onChange={(e) => {
            setForm({ ...form, certification_name: e.target.value });
            if (fieldErrors.certification_name) setFieldErrors((prev) => ({ ...prev, certification_name: undefined }));
          }}
          error={fieldErrors.certification_name}
          required
        />
        <Input
          label="Issuing organization"
          placeholder="e.g. Amazon Web Services"
          value={form.issuing_organization}
          onChange={(e) => setForm({ ...form, issuing_organization: e.target.value })}
        />
        <Input label="Issue date" type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
        <Input
          label="Credential ID"
          value={form.credential_id}
          onChange={(e) => setForm({ ...form, credential_id: e.target.value })}
        />
        <Input
          label="Credential URL"
          placeholder="https://credential-issuer.com/verify/123"
          value={form.credential_url}
          onChange={(e) => {
            setForm({ ...form, credential_url: e.target.value });
            if (fieldErrors.credential_url) setFieldErrors((prev) => ({ ...prev, credential_url: undefined }));
          }}
          error={fieldErrors.credential_url}
        />
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : editingId ? 'Update certification' : 'Add certification'}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {draft.certifications.length === 0 ? (
        <EmptySectionState
          message="No certifications added yet."
          actionLabel="+ Add your first certification"
          onAction={() => nameRef.current?.focus()}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {draft.certifications.map((cert) => (
            <li key={cert.certification_id} className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-sm">
              <p className="font-medium">
                {cert.certification_name}
                {cert.issuing_organization ? ` · ${cert.issuing_organization}` : ''}
              </p>
              <div className="flex gap-3">
                <button onClick={() => startEdit(cert)} className="text-primary-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => setPendingDeleteId(cert.certification_id)} className="text-danger-500 hover:text-danger-700">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        message="Remove this certification? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
