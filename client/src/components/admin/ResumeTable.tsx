import React from 'react';
import { Link } from 'react-router-dom';
import { AdminResumeListItem } from '../../types/admin';

interface ResumeTableProps {
  resumes: AdminResumeListItem[];
  onDelete: (resumeId: number) => void;
}

export function ResumeTable({ resumes, onDelete }: ResumeTableProps) {
  if (resumes.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No resumes match your search.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Owner</th>
            <th className="px-3 py-2">Template</th>
            <th className="px-3 py-2">Color</th>
            <th className="px-3 py-2">Created</th>
            <th className="px-3 py-2">Updated</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {resumes.map((r) => (
            <tr key={r.resume_id} className="border-b border-gray-100">
              <td className="px-3 py-2">{r.title}</td>
              <td className="px-3 py-2">
                <div className="flex flex-col">
                  <span>{r.owner_full_name}</span>
                  <span className="text-xs text-gray-500">{r.owner_email}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-gray-600">{r.template_name ?? '—'}</td>
              <td className="px-3 py-2">
                {r.accent_color ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: r.accent_color }}
                    />
                    <span className="text-xs text-gray-500">{r.accent_color}</span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Default</span>
                )}
              </td>
              <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
              <td className="px-3 py-2">{new Date(r.updated_at).toLocaleDateString()}</td>
              <td className="px-3 py-2">
                <div className="flex items-center justify-end gap-3">
                  <Link to={`/admin/resumes/${r.resume_id}`} className="text-primary-700 hover:underline">
                    View
                  </Link>
                  <button
                    onClick={() => onDelete(r.resume_id)}
                    className="text-danger-500 hover:text-danger-700"
                    aria-label={`Remove ${r.title}`}
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
