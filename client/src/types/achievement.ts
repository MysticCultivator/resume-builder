export interface Achievement {
  achievement_id: number;
  resume_id: number;
  title: string;
  description?: string | null;
  achieved_date?: string | null;
  order_index: number;
}

export type AchievementInput = Omit<Achievement, 'achievement_id' | 'resume_id' | 'order_index'> & { order_index?: number };
