import { useState, useEffect, useMemo } from 'react';
import { showLoading } from '@/utils/toast';
import { Event, Deadline } from '@/types';
import { differenceInDays, addDays, subDays, isSameDay, parseISO } from 'date-fns';

// Aggiorna il tipo per includere i nuovi tipi di scadenza specifici per e-learning
export interface Deadline {
  type: 'docente' | 'discenti_standard' | 'avvio_standard' | 'giorno_evento_registri' | 'post_evento_feedback' | 'post_evento_modello_l' | 'discenti_elearning' | 'comunicazione_scuola' | 'lettera_abilitazione' | 'mail_sollecito_1' | 'mail_sollecito_2' | 'avviso_proroga' | 'relazione_finale';
  date: Date;
  message: string;
  eventId: string;
  completed: boolean;
  eventTitle: string;
}


export const useDeadlines = (events: Event[]) => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  const calculateDeadlinesForEvent = (event: Event): Deadline[] => {
    const eventDeadlines: Deadline[] = [];
    if (!event.start_date) return [];
    
    const startDate = parseISO(event.start_date);
    const endDate = event.end_date ? parseISO(event.end_date) : startDate; // Usa end_date se disponibile, altrimenti start_date

    // Logica scadenze basata sul tipo di corso
    if (event.type === 'e-learning') { // MODIFICATO: Solo 'e-learning' qui
      // Scadenze per corsi e-learning
      
      // Richiesta Discenti: 5 giorni prima
      eventDeadlines.push({
        type: 'discenti_elearning',
        date: subDays(startDate, 5),
        message: `Richiesta discenti (e-learning) per "${event.title}"`,
        eventId: event.id,
        completed: event.completed_tasks?.includes('richiesta_discenti_elearning_fatta') || false,
        eventTitle: event.title,
      });

      // Comunicazione alla Scuola PEF/Altro: 3 giorni prima
      eventDeadlines.push({
        type: 'comunicazione_scuola',
        date: subDays(startDate, 3),
        message: `Comunicazione alla Scuola PEF/Altro per "${event.title}"`,
        eventId: event.id,
        completed: event.completed_tasks?.includes('comunicazione_scuola_fatta') || false,
        eventTitle: event.title,
      });

      // Lettera Abilitazione al Corso: 1 giorno prima
      eventDeadlines.push({
        type: 'lettera_abilitazione',
        date: subDays(startDate, 1),
        message: `Lettera Abilitazione al Corso per "${event.title}"`,
        eventId: event.id,
        completed: event.completed_tasks?.includes('lettera_abilitazione_fatta') || false,
        eventTitle: event.title,
      });

      // Mail di sollecito: 15 giorni dopo inizio
      eventDeadlines.push({
        type: 'mail_sollecito_1',
        date: addDays(startDate, 15),
        message: `Prima mail di sollecito per "${event.title}"`,
        eventId: event.id,
        completed: event.completed_tasks?.includes('mail_sollecito_1_fatta') || false,
        eventTitle: event.title,
      });

      // 2 Mail di sollecito: 25 giorni dopo inizio
      eventDeadlines.push({
        type: 'mail_sollecito_2',
        date: addDays(startDate, 25),
        message: `Seconda mail di sollecito per "${event.title}"`,
        eventId: event.id,
        completed: event.completed_tasks?.includes('mail_sollecito_2_fatta') || false,
        eventTitle: event.title,
      });

      // Avviso Proroga (eventuale): 1 giorno dopo fine evento
      eventDeadlines.push({
        type: 'avviso_proroga',
        date: addDays(endDate, 1), // Basato sulla data di fine
        message: `Avviso Proroga (eventuale) per "${event.title}"`,
        eventId: event.id,
        completed: event.completed_tasks?.includes('avviso_proroga_fatto') || false,
        eventTitle: event.title,
      });

      // Relazione Finale: 30 giorni dopo inizio
      eventDeadlines.push({
        type: 'relazione_finale',
        date: addDays(startDate, 30),
        message: `Relazione Finale per "${event.title}"`,
        eventId: event.id,
        completed: event.completed_tasks?.includes('relazione_finale_fatta') || false,
        eventTitle: event.title,
      });

    } else {
      // Scadenze per altri tipi di corso (Centralizzato, Periferico, Iniziativa, Didattica a distanza (DAD) o non specificato)

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
        type: 'discenti_standard', // Rinominato per chiarezza
        date: subDays(startDate, 25),
        message: `Creare richiesta discenti per "${event.title}"`,
        eventId: event.id,
        completed: event.completed_tasks?.includes('richiesta_discenti_standard_fatta') || false, // Aggiornato chiave
        eventTitle: event.title,
      });

      // 10 giorni prima: Avvio Corso
      eventDeadlines.push({
        type: 'avvio_standard', // Rinominato per chiarezza
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
        date: addDays(endDate, 1), // Basato sulla data di fine
        message: `Raccogliere feedback per "${event.title}"`,
        eventId: event.id,
        completed: event.completed_tasks?.includes('feedback_raccolto') || false,
        eventTitle: event.title,
      });
      
      // Post-evento (es. 2 giorni dopo): Modello L
       eventDeadlines.push({
        type: 'post_evento_modello_l',
        date: addDays(endDate, 2), // Basato sulla data di fine
        message: `Generare Modello L per "${event.title}"`,
        eventId: event.id,
        completed: event.completed_tasks?.includes('modello_l_generato') || false,
        eventTitle: event.title,
      });
    }


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
        // Utilizza showLoading per mostrare il toast
        showLoading(`SCADENZA OGGI: ${deadline.message}`);
      }
    });

  }, [events]); // Dipendenza da events per ricalcolare quando la lista eventi cambia

  return { deadlines };
};