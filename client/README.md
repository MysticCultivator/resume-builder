# Resume Builder — Client

React + TypeScript + Tailwind CSS, bundled with Vite. See root `README.md` for setup instructions.

## Structure
- `src/pages` — routed pages (dashboard, resume builder, admin, etc.)
- `src/components` — module-organized components (auth, resume-form, preview, pdf, admin, shared)
- `src/layouts` — page shells (public / authenticated app / admin)
- `src/contexts` — `AuthContext`, `ResumeBuilderContext`
- `src/routes` — `ProtectedRoute`, `AdminRoute`
- `src/services` — typed API client wrappers, one per backend resource
- `src/types` — shared TypeScript models matching the database schema
- `src/templates` — resume template renderers (preview + PDF)
