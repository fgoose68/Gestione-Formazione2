export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  teacher: string[];
  student: string[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}