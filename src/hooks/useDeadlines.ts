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
      date: subDays(startDate, 8),
      message: `Richiesta discenti (E-learning) per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_discenti_elearning_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'comunicazione_scuola',
      date: subDays(startDate, 7),
      message: `Comunicazione alla Scuola PEF/Altro per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('comunicazione_scuola_fatta') || false,
      eventTitle: event.title,
    });

    // Altre scadenze E-learning...
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

    // Altre scadenze standard...
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