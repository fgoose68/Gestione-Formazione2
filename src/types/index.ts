export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  location?: string;
  teachers: string[];
  // students: string[]; // Questo campo è stato rimosso
  status: 'in_preparazione' | 'completato' | 'archiviato';
  user_id: string | null; // Reso nullable
  created_at: string; // ISO string
  type?: 'Centralizzato' | 'Periferico' | 'Iniziativa' | 'E-learning' | 'Didattica a distanza (DAD)'; // Nuovo campo per il tipo di corso, aggiornato a 'Didattica a distanza (DAD)'
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
  user_id?: string | null; // Reso nullable
  // `absent` sarà calcolato dinamicamente
}