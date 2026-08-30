export interface Experience {
  experience_id: number;
  resume_id: number;
  company_name: string;
  job_title: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  order_index: number;
}

export type ExperienceInput = Omit<Experience, 'experience_id' | 'resume_id' | 'order_index'> & { order_index?: number };
