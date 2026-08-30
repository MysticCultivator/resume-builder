import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'My Resumes' },
  { to: '/templates', label: 'Templates' },
];

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-paper p-4 sm:block">
      <ul className="flex flex-col gap-0.5">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-800' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-primary-700' : 'bg-transparent'}`}
                  />
                  {link.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
