import { parseISO, subDays, isBefore, isToday, addDays } from 'date-fns'; // Aggiunto addDays
import { Event } from '@/types';
import { Deadline } from '@/types'; // Importa Deadline dal tuo types/index.ts

// Definisci l'interfaccia Deadline qui se non è già in types/index.ts
// export interface Deadline {
//   type: string; // Questo sarà il tipo specifico (es. 'docente', 'discenti_elearning')
//   date: Date;
//   message: string;
//   eventId: string;
//   completed: boolean;
//   eventTitle: string;
// }

const calculateDeadlinesForEvent = (event: Event): Deadline[] => {
  const eventDeadlines: Deadline[] = [];
  if (!event.start_date) return [];
  
  const startDate = parseISO(event.start_date);
  const endDate = event.end_date ? parseISO(event.end_date) : startDate;

  if (event.type === 'E-learning') {
    // Scadenze per corsi E-learning
    eventDeadlines.push({
      type: 'discenti_elearning',
      date: subDays(startDate, 8), // Modificato da 5 a 8 giorni prima
      message: `Richiesta discenti (E-learning) per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_discenti_elearning_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'comunicazione_scuola',
      date: subDays(startDate, 7), // Modificato a 7 giorni prima
      message: `Comunicazione alla Scuola PEF/Altro per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('comunicazione_scuola_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'lettera_abilitazione',
      date: subDays(startDate, 1),
      message: `Lettera Abilitazione al Corso per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('lettera_abilitazione_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'mail_sollecito_1',
      date: addDays(startDate, 15),
      message: `Prima mail di sollecito per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('mail_sollecito_1_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'mail_sollecito_2',
      date: addDays(startDate, 25),
      message: `Seconda mail di sollecito per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('mail_sollecito_2_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'avviso_proroga',
      date: addDays(endDate, 1),
      message: `Avviso Proroga (eventuale) per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('avviso_proroga_fatto') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'relazione_finale',
      date: addDays(startDate, 30), // Basato sull'inizio del corso per E-learning
      message: `Relazione Finale per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('relazione_finale_fatta') || false,
      eventTitle: event.title,
    });

  } else {
    // Scadenze per corsi standard
    eventDeadlines.push({
      type: 'docente',
      date: subDays(startDate, 30),
      message: `Richiesta docenti per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_docente_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'discenti_standard', // Tipo specifico per standard
      date: subDays(startDate, 25),
      message: `Creare richiesta discenti per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_discenti_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'avvio_standard', // Tipo specifico per standard
      date: subDays(startDate, 10),
      message: `Preparare Avvio Corso per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('avvio_corso_fatto') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'giorno_evento_registri',
      date: startDate,
      message: `Gestire registri per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('gestione_registri_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'post_evento_feedback',
      date: addDays(endDate, 1),
      message: `Raccogliere feedback per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('raccolta_feedback_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'post_evento_modello_l',
      date: addDays(endDate, 2),
      message: `Generare Modello L per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('generazione_modello_l_fatta') || false,
      eventTitle: event.title,
    });
  }

  return eventDeadlines;
};

export const useDeadlines = (events: Event[]) => {
  const deadlines = events.flatMap(calculateDeadlinesForEvent);
  
  return {
    deadlines,
    upcomingDeadlines: deadlines.filter(d => !d.completed && !isBefore(d.date, new Date())),
    pastDeadlines: deadlines.filter(d => isBefore(d.date, new Date()) && !isToday(d.date)),
    todayDeadlines: deadlines.filter(d => isToday(d.date))
  };
};