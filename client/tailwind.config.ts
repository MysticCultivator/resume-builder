import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm neutral scale used for backgrounds, borders and body text
        // throughout the app (replaces Tailwind's cool default `gray`, which
        // is one of the strongest "generic AI dashboard" signals). Existing
        // `bg-gray-*` / `text-gray-*` / `border-gray-*` usage across the
        // codebase now resolves to this warm scale automatically.
        gray: {
          50: '#faf8f5',
          100: '#f3efe9',
          200: '#e6ded3',
          300: '#d4c9b8',
          400: '#aa9d8a',
          500: '#8a7d6c',
          600: '#6b5f52',
          700: '#514740',
          800: '#3a332e',
          900: '#26211d',
        },
        // Restrained evergreen accent. Existing `bg-primary-*` /
        // `text-primary-*` / `border-primary-*` usage (buttons, links,
        // active nav state, focus rings) now resolves here instead of the
        // old bright-blue palette — used sparingly, never as a full-bleed
        // interface color.
        primary: {
          50: '#eef2ee',
          100: '#dbe4dc',
          200: '#b7c9b9',
          300: '#8fab92',
          400: '#5f8564',
          500: '#3f6844',
          600: '#2d4f32',
          700: '#25422a',
          800: '#1e3522',
          900: '#172a1a',
        },
        // Warm off-white page background / paper surface — distinct tokens
        // so the page shell and the "document" surfaces (resume paper,
        // cards) can be told apart deliberately rather than both being
        // plain white.
        paper: '#fffefb',
        ivory: '#faf7f1',
        success: {
          50: '#f0f5ee',
          600: '#4b7a4f',
          700: '#3c6440',
        },
        danger: {
          50: '#fbeeec',
          200: '#eccbc3',
          400: '#c46e5c',
          500: '#b3402f',
          600: '#a3382a',
          700: '#872e23',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Restrained editorial serif, used sparingly for marketing headings
        // (landing page) only — the product UI and the resume documents
        // themselves stay on the sans stack for clarity and ATS-safety.
        serif: ['"Source Serif 4"', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        // Deliberately minimal — most surfaces use a border instead of a
        // shadow (see §21). Kept only for things that represent genuine
        // physical elevation: a dropdown/modal, and the resume "paper".
        subtle: '0 1px 2px rgba(38, 33, 29, 0.05)',
        paper: '0 1px 3px rgba(38, 33, 29, 0.08), 0 8px 24px -12px rgba(38, 33, 29, 0.18)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        // Single, quiet opacity transition — replaces the old translate-based
        // "fade-in-up" and the animated gradient blob-drift entirely.
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
