export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  teachers: string[];
  students: string[];
  type: 'centralizzato' | 'periferico' | 'iniziativa' | 'e-learning';
  status: 'in_preparazione' | 'completato' | 'archiviato';
  user_id: string;
  created_at: string;
}