export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  teachers: string[];
  students: string[];
  status: 'in_preparazione' | 'completato';
  user_id: string;
  created_at: string;
}