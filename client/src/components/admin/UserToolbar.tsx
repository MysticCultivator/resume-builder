import React from 'react';
import { Input } from '../shared/Input';
import { UserRoleFilter, UserSort } from '../../types/admin';

const selectClass = 'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

interface UserToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: UserRoleFilter;
  onRoleChange: (value: UserRoleFilter) => void;
  sort: UserSort;
  onSortChange: (value: UserSort) => void;
}

export function UserToolbar({ search, onSearchChange, role, onRoleChange, sort, onSortChange }: UserToolbarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <Input
          label="Search"
          placeholder="Username, name, or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="user-role-filter" className="text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="user-role-filter"
          className={selectClass}
          value={role}
          onChange={(e) => onRoleChange(e.target.value as UserRoleFilter)}
        >
          <option value="all">All</option>
          <option value="user">Regular users</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="user-sort" className="text-sm font-medium text-gray-700">
          Sort
        </label>
        <select id="user-sort" className={selectClass} value={sort} onChange={(e) => onSortChange(e.target.value as UserSort)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </select>
      </div>
    </div>
  );
}
