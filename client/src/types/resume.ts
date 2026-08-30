import { Education } from './education';
import { Experience } from './experience';
import { Project } from './project';
import { Skill } from './skill';
import { Certification } from './certification';
import { Achievement } from './achievement';
import { Template } from './template';

export type ResumeFontSize = 'small' | 'medium' | 'large';
export type ResumeSpacing = 'compact' | 'normal' | 'spacious';

/** Simple resume layout customization (Part 4 §1) — a small, fixed set of
 *  options rather than an open-ended style/theme object. Applied to both
 *  the live preview and the generated PDF. */
export interface ResumeCustomization {
  fontSize: ResumeFontSize;
  spacing: ResumeSpacing;
  accentColor: string;
}

export interface Resume {
  resume_id: number;
  user_id: number;
  template_id: number | null;
  title: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  summary?: string | null;
  /** Null for resumes created before this feature, or that never changed
   *  the defaults — always resolve through `resolveCustomization()` before
   *  rendering (see utils/resumeCustomization.ts) rather than reading raw. */
  customization?: ResumeCustomization | null;
  created_at: string;
  updated_at: string;
  /** Only present on the dashboard list endpoint (joined server-side) — the
   *  name of the currently selected template, or null if none is selected. */
  template_name?: string | null;
}

export interface ResumeWithSections {
  resume: Resume;
  template: Template | null;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
}

export type ResumeInput = Partial<
  Pick<Resume, 'title' | 'template_id' | 'full_name' | 'email' | 'phone' | 'location' | 'summary' | 'customization'>
>;
