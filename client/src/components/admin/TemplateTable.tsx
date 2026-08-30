import React from 'react';
import { Template } from '../../types/template';
import { TemplateUsage } from '../../types/admin';

interface TemplateTableProps {
  templates: Template[];
  /** Template names with a real renderer — these can't be deleted (Part 3 §13). */
  builtInNames?: string[];
  /** Per-template resume counts + percentages (Part 9/Part 10). Optional so
   *  this table still renders sensibly while usage is loading. */
  usage?: TemplateUsage[];
  onDelete: (templateId: number) => void;
  onEdit: (template: Template) => void;
}

export function TemplateTable({ templates, builtInNames = [], usage = [], onDelete, onEdit }: TemplateTableProps) {
  if (templates.length === 0) {
    return <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">No templates yet.</p>;
  }

  const usageByTemplateId = new Map(usage.map((u) => [u.template_id, u]));

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Thumbnail</th>
            <th className="px-3 py-2">Usage</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => {
            const isBuiltIn = builtInNames.includes(t.template_name);
            const templateUsage = usageByTemplateId.get(t.template_id);
            return (
              <tr key={t.template_id} className="border-b border-gray-100">
                <td className="px-3 py-2">
                  {t.template_name}
                  {isBuiltIn && <span className="ml-2 text-xs text-gray-400">(built-in)</span>}
                </td>
                <td className="max-w-[220px] break-all px-3 py-2 text-gray-500">{t.thumbnail_url || '—'}</td>
                <td className="px-3 py-2 text-gray-600">
                  {templateUsage ? `${templateUsage.resume_count} resumes — ${templateUsage.percentage}%` : '—'}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => onEdit(t)}
                      className="text-primary-700 hover:text-primary-900"
                      aria-label={`Edit ${t.template_name}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(t.template_id)}
                      disabled={isBuiltIn}
                      title={isBuiltIn ? "Built-in templates can't be deleted" : undefined}
                      className="text-danger-500 hover:text-danger-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:text-gray-300"
                      aria-label={`Remove ${t.template_name}`}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
