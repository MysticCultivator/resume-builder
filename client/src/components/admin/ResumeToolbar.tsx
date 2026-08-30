import React from 'react';
import { Input } from '../shared/Input';
import { ResumeSort } from '../../types/admin';
import { Template } from '../../types/template';

const selectClass = 'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

interface ResumeToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  templates: Template[];
  templateId: number | undefined;
  onTemplateChange: (value: number | undefined) => void;
  sort: ResumeSort;
  onSortChange: (value: ResumeSort) => void;
}

export function ResumeToolbar({ search, onSearchChange, templates, templateId, onTemplateChange, sort, onSortChange }: ResumeToolbarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <Input
          label="Search"
          placeholder="Resume title, username, or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="resume-template-filter" className="text-sm font-medium text-gray-700">
          Template
        </label>
        <select
          id="resume-template-filter"
          className={selectClass}
          value={templateId ?? ''}
          onChange={(e) => onTemplateChange(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">All templates</option>
          {templates.map((t) => (
            <option key={t.template_id} value={t.template_id}>
              {t.template_name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="resume-sort" className="text-sm font-medium text-gray-700">
          Sort
        </label>
        <select id="resume-sort" className={selectClass} value={sort} onChange={(e) => onSortChange(e.target.value as ResumeSort)}>
          <option value="updated_desc">Recently updated</option>
          <option value="updated_asc">Oldest updated</option>
          <option value="created_desc">Newest created</option>
          <option value="created_asc">Oldest created</option>
          <option value="title_asc">Title A–Z</option>
        </select>
      </div>
    </div>
  );
}
