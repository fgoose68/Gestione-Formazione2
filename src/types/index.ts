export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  location?: string;
  teachers: string[];
  students: string[];
  type: 'centralizzato' | 'periferico' | 'iniziativa' | 'e-learning';
  status: 'in_preparazione' | 'completato' | 'archiviato';
  user_id: string;
  created_at: string; // ISO string
  completed_tasks?: string[];
}