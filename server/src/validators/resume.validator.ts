import { z } from 'zod';

// A note on `.nullable().optional()` below, used for every field that maps
// to a nullable, "user might intentionally blank this out" DB column:
//   - key omitted entirely -> field not provided -> update leaves it alone
//   - key present, value null -> field intentionally cleared -> set NULL
//   - key present, value X -> field updated to X
// This three-state distinction is what lets repositories build a real SET
// clause instead of COALESCE (see utils/dynamicUpdate.ts), so a user can
// actually clear a field instead of it silently keeping its old value.
// Required, non-nullable fields (e.g. title, institution_name) intentionally
// do NOT get `.nullable()` — they can be left out of a partial update, but
// never explicitly cleared to null.

// Simple resume layout customization — see Part 4 §1. Kept intentionally
// small (3 fields, fixed option sets) rather than an open-ended style object.
export const resumeCustomizationSchema = z.object({
  fontSize: z.enum(['small', 'medium', 'large']),
  spacing: z.enum(['compact', 'normal', 'spacious']),
  accentColor: z.string().max(20),
});

export const createResumeSchema = z.object({
  title: z.string().min(1).max(150),
  template_id: z.number().int().positive().nullable().optional(),
  full_name: z.string().max(150).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  location: z.string().max(150).nullable().optional(),
  summary: z.string().nullable().optional(),
  customization: resumeCustomizationSchema.nullable().optional(),
});

export const updateResumeSchema = createResumeSchema.partial();

export const educationSchema = z.object({
  institution_name: z.string().min(1).max(200),
  degree: z.string().max(150).nullable().optional(),
  field_of_study: z.string().max(150).nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  gpa: z.string().max(20).nullable().optional(),
  order_index: z.number().int().optional(),
  education_level: z.enum(['primary', 'secondary', 'higher_secondary', 'degree']).nullable().optional(),
});

export const experienceSchema = z.object({
  company_name: z.string().min(1).max(150),
  job_title: z.string().min(1).max(150),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().optional(),
  description: z.string().nullable().optional(),
  order_index: z.number().int().optional(),
});

export const projectSchema = z.object({
  project_name: z.string().min(1).max(150),
  description: z.string().nullable().optional(),
  project_link: z.string().url().nullable().optional(),
  technologies: z.string().nullable().optional(),
  order_index: z.number().int().optional(),
});

export const skillSchema = z.object({
  skill_name: z.string().min(1).max(100),
  category: z.string().max(50).nullable().optional(),
  proficiency_level: z.string().max(50).nullable().optional(),
});

export const certificationSchema = z.object({
  certification_name: z.string().min(1).max(200),
  issuing_organization: z.string().max(200).nullable().optional(),
  issue_date: z.string().nullable().optional(),
  credential_id: z.string().max(150).nullable().optional(),
  credential_url: z.string().url().nullable().optional(),
  order_index: z.number().int().optional(),
});

export const achievementSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  achieved_date: z.string().nullable().optional(),
  order_index: z.number().int().optional(),
});
