export type Role = 'user' | 'admin';

export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}
