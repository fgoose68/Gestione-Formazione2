import { useState, useEffect, useMemo } from 'react';
import { showLoading } from '@/utils/toast';
import { Event, Deadline } from '@/types';
import { differenceInDays, addDays, subDays, isSameDay, parseISO } from 'date-fns';

export const useDeadlines = (events: Event[]) => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  const calculateDeadlinesForEvent = (event: Event): Deadline[] => {
    const eventDeadlines: Deadline[] = [];
    if (!event.start_date) return [];
    
    const startDate = parseISO(event.start_date);

    // 30 giorni prima: richiesta docenti
    eventDeadlines.push({
      type: 'docente',
      date: subDays(startDate, 30),
      message: `Redigere richiesta docenti per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_docenti_fatta') || false,
      eventTitle: event.title,
    });

    // 25 giorni prima: richiesta discenti
    eventDeadlines.push({
      type: 'discenti',
      date: subDays(startDate, 25),
      message: `Creare richiesta discenti per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_discenti_fatta') || false,
      eventTitle: event.title,
    });

    // 10 giorni prima: Avvio Corso
    eventDeadlines.push({
      type: 'avvio',
      date: subDays(startDate, 10),
      message: `Preparare Avvio Corso per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('avvio_corso_fatto') || false,
      eventTitle: event.title,
    });
    
    // Giorno dell'evento: Registri
    eventDeadlines.push({
      type: 'giorno_evento_registri',
      date: startDate,
      message: `Gestire registri per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('registri_gestiti') || false,
      eventTitle: event.title,
    });

    // Post-evento (es. 1 giorno dopo): Feedback
    eventDeadlines.push({
      type: 'post_evento_feedback',
      date: addDays(startDate, 1), // Esempio, potrebbe essere end_date + 1
      message: `Raccogliere feedback per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('feedback_raccolto') || false,
      eventTitle: event.title,
    });
    
    // Post-evento (es. 2 giorni dopo): Modello L
     eventDeadlines.push({
      type: 'post_evento_modello_l',
      date: addDays(startDate, 2), // Esempio
      message: `Generare Modello L per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('modello_l_generato') || false,
      eventTitle: event.title,
    });


    return eventDeadlines;
  };

  useEffect(() => {
    if (!events || events.length === 0) {
      setDeadlines([]);
      return;
    }

    const allDeadlines = events.flatMap(event => calculateDeadlinesForEvent(event));
    const today = new Date();
    
    const upcoming = allDeadlines
      .filter(d => !d.completed && d.date >= today) // Solo non completate e future/odierne
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    setDeadlines(upcoming);

    // Mostra notifiche per scadenze oggi non completate
    upcoming.forEach(deadline => {
      if (isSameDay(deadline.date, today) && !deadline.completed) {
        showLoading(`SCADENZA OGGI: ${deadline.message}`);
      }
    });

  }, [events]);

  return { deadlines };
};