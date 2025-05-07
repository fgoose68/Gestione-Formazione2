export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  location?: string;
  teachers: string[];
  students: string[];
  status: 'in_preparazione' | 'completato' | 'archiviato';
  user_id: string;
  created_at: string; // ISO string
  // Campi aggiuntivi per la gestione delle scadenze lato client, se necessario
  completed_tasks?: string[]; // es. ['richiesta_docenti_fatta', 'richiesta_discenti_fatta']
}

export interface Deadline {
  type: 'docente' | 'discenti' | 'avvio' | 'giorno_evento_registri' | 'post_evento_feedback' | 'post_evento_modello_l';
  date: Date;
  message: string;
  eventId: string;
  completed: boolean;
  eventTitle: string;
}