export interface Project {
  project_id: number;
  resume_id: number;
  project_name: string;
  description?: string | null;
  project_link?: string | null;
  order_index: number;
  technologies?: string | null;
}

export type ProjectInput = Omit<Project, 'project_id' | 'resume_id' | 'order_index'> & { order_index?: number };
