export interface Certification {
  certification_id: number;
  resume_id: number;
  certification_name: string;
  issuing_organization?: string | null;
  issue_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  order_index: number;
}

export type CertificationInput = Omit<Certification, 'certification_id' | 'resume_id' | 'order_index'> & { order_index?: number };
