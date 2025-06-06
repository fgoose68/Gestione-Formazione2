import { parseISO, subDays, isBefore, isToday } from 'date-fns';
import { Event } from '@/types';

export interface Deadline {
  type: string;
  date: Date;
  message: string;
  eventId: string;
  completed: boolean;
  eventTitle: string;
}

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

    // Altre scadenze E-learning rimangono invariate
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
      date: subDays(startDate, -15), // 15 giorni dopo l'inizio
      message: `Prima mail di sollecito per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('mail_sollecito_1_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'mail_sollecito_2',
      date: subDays(startDate, -25), // 25 giorni dopo l'inizio
      message: `Seconda mail di sollecito per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('mail_sollecito_2_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'avviso_proroga',
      date: subDays(endDate, -1), // 1 giorno dopo la fine
      message: `Avviso Proroga (eventuale) per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('avviso_proroga_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'relazione_finale',
      date: subDays(startDate, -30), // 30 giorni dopo l'inizio
      message: `Relazione Finale per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('relazione_finale_fatta') || false,
      eventTitle: event.title,
    });
  } else {
    // Scadenze per corsi standard rimangono invariate
    eventDeadlines.push({
      type: 'docente',
      date: subDays(startDate, 30),
      message: `Richiesta docenti per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_docente_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'discenti_standard',
      date: subDays(startDate, 25),
      message: `Richiesta discenti per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_discenti_standard_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'avvio_standard',
      date: subDays(startDate, 10),
      message: `Preparazione Avvio Corso per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('avvio_standard_fatto') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'giorno_evento_registri',
      date: startDate,
      message: `Gestione Registri per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('giorno_evento_registri_fatto') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'post_evento_feedback',
      date: subDays(endDate, -1),
      message: `Raccolta Feedback per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('post_evento_feedback_fatto') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'post_evento_modello_l',
      date: subDays(endDate, -2),
      message: `Generazione Modello L per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('post_evento_modello_l_fatto') || false,
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