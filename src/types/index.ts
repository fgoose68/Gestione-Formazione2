export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  location?: string;
  teachers: string[];
  status: 'in_preparazione' | 'completato' | 'archiviato'; // Questo è lo stato del database
  displayStatus?: 'concluso' | 'in_corso' | 'in_programma' | 'archiviato'; // Questo è lo stato calcolato per la visualizzazione
  user_id: string | null; // Reso nullable
  created_at: string; // ISO string
  type?: 'Centralizzato' | 'Periferico' | 'Iniziativa' | 'E-learning' | 'Didattica a distanza (DAD)'; // Nuovo campo per il tipo di corso, aggiornato a 'Didattica a distanza (DAD)'
  completed_tasks?: string[]; // Aggiunto per le scadenze
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