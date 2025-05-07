export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  location?: string;
  teachers: string[];
  students: string[]; // Questo potrebbe diventare obsoleto o usato per un elenco generale
  status: 'in_preparazione' | 'completato' | 'archiviato';
  user_id: string;
  created_at: string; // ISO string
  completed_tasks?: string[];
}

export interface Deadline {
  type: 'docente' | 'discenti' | 'avvio' | 'giorno_evento_registri' | 'post_evento_feedback' | 'post_evento_modello_l';
  date: Date;
  message: string;
  eventId: string;
  completed: boolean;
  eventTitle: string;
}

export interface DepartmentAttendee {
  id?: string; // Opzionale perché potrebbe non esserci all'inizio
  event_id: string;
  department_name: string;
  officers: number;
  inspectors: number;
  superintendents: number;
  militari: number; // Per App./Fin.
  expected: number;
  actual: number;
  user_id?: string; // Opzionale perché il client potrebbe non averlo subito
  // `absent` sarà calcolato dinamicamente
}