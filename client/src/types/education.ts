export type EducationLevel = 'primary' | 'secondary' | 'higher_secondary' | 'degree';

export interface Education {
  education_id: number;
  resume_id: number;
  institution_name: string;
  degree?: string | null;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  gpa?: string | null;
  order_index: number;
  education_level?: EducationLevel | null;
}

export type EducationInput = Omit<Education, 'education_id' | 'resume_id' | 'order_index'> & { order_index?: number };
