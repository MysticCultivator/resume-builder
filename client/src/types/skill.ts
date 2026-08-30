// The real database's skills table has no CHECK constraint on these — kept
// as free-text VARCHAR columns — so these unions are suggested values for
// the UI (dropdown options) rather than enforced types.
export type SkillCategory = 'technical' | 'soft';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  skill_id: number;
  resume_id: number;
  skill_name: string;
  category?: string | null;
  proficiency_level?: string | null;
}

export type SkillInput = Omit<Skill, 'skill_id' | 'resume_id'>;
