import React from 'react';
import { adminService } from '../../services/adminService';
import { DocumentIcon } from '../../components/shared/icons';

interface ExportCardProps {
  title: string;
  description: string;
  columns: string[];
  href: string;
  filename: string;
}

function ExportCard({ title, description, columns, href, filename }: ExportCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <DocumentIcon className="mt-0.5 h-6 w-6 shrink-0 text-gray-400" />
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">Columns: {columns.join(', ')}</p>
      <a
        href={href}
        download={filename}
        className="w-fit rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
      >
        Download CSV
      </a>
    </div>
  );
}

export function AdminExportPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Export data</h1>
        <p className="mt-1 text-sm text-gray-500">
          Download platform data as CSV. Exports never include passwords, password hashes, or session data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ExportCard
          title="Users"
          description="Every registered user with their resume count."
          columns={['ID', 'Username', 'Name', 'Email', 'Role', 'Resume Count', 'Created At']}
          href={adminService.exportUsersUrl()}
          filename="users.csv"
        />
        <ExportCard
          title="Resumes"
          description="Every resume on the platform with its owner and template."
          columns={['Resume ID', 'Resume Title', 'User ID', 'Username', 'Email', 'Template', 'Color', 'Created At', 'Updated At']}
          href={adminService.exportResumesUrl()}
          filename="resumes.csv"
        />
        <ExportCard
          title="Template usage"
          description="Resume count and usage percentage for every template."
          columns={['Template', 'Resume Count', 'Usage Percentage']}
          href={adminService.exportTemplatesUrl()}
          filename="template-usage.csv"
        />
      </div>
    </div>
  );
}
