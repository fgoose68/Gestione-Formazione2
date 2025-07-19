import { parseISO, subDays, isBefore, isToday, addDays, startOfDay } from 'date-fns';
import { Event } from '@/types';
import { Deadline } from '@/types';

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
      date: addDays(startDate, 30),
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
      type: 'discenti_standard',
      date: subDays(startDate, 25),
      message: `Creare richiesta discenti per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_discenti_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'avvio_standard',
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

  // Aggiungi la scadenza dalla checklist se presente
  if (event.completed_tasks && Array.isArray(event.completed_tasks)) {
    console.log(`[useDeadlines] Processing event ${event.title}, completed_tasks:`, event.completed_tasks);
    const risposteTask = event.completed_tasks.find(task => 
      typeof task === 'string' && task.startsWith('checklist_risposte_reparti_entro:')
    );
    console.log(`[useDeadlines] risposteTask found:`, risposteTask);
    if (risposteTask) {
      const dateString = risposteTask.split(':')[1];
      console.log(`[useDeadlines] dateString extracted:`, dateString);
      if (dateString) {
        try {
          // Estrai anno, mese, giorno dalla stringa YYYY-MM-DD
          const [year, month, day] = dateString.split('-').map(Number);
          // Crea un nuovo oggetto Date nel fuso orario locale, impostando l'ora a mezzanotte
          // Il mese è 0-indexed nel costruttore Date (es. Luglio è 6)
          const deadlineDate = new Date(year, month - 1, day); 
          
          const todayNormalized = startOfDay(new Date()); // Questo è l'inizio del giorno locale

          console.log(`[useDeadlines] Created deadlineDate (local midnight):`, deadlineDate);
          console.log(`[useDeadlines] Normalized current date (local midnight):`, todayNormalized);
          console.log(`[useDeadlines] Is deadlineDate today (local normalized)?`, isToday(deadlineDate));

          eventDeadlines.push({
            type: 'risposte_reparti',
            date: deadlineDate, // Usa la data localmente normalizzata
            message: `Risposte dei Reparti per "${event.title}"`,
            eventId: event.id,
            completed: false, // Questa scadenza è solo una notifica
            eventTitle: event.title,
          });
          console.log(`[useDeadlines] Added 'risposte_reparti' deadline for ${event.title}`);
        } catch (e) {
          console.error(`[useDeadlines] Formato data non valido per la scadenza della checklist: ${dateString}`, e);
        }
      } else {
        console.log(`[useDeadlines] dateString is empty for risposteTask:`, risposteTask);
      }
    } else {
      console.log(`[useDeadlines] No 'checklist_risposte_reparti_entro:' task found in completed_tasks.`);
    }
  } else {
    console.log(`[useDeadlines] event.completed_tasks is not an array or is empty for event ${event.title}.`);
  }

  return eventDeadlines;
};

export const useDeadlines = (events: Event[]) => {
  const deadlines = events.flatMap(calculateDeadlinesForEvent);
  
  return {
    deadlines,
    upcomingDeadlines: deadlines.filter(d => !d.completed && !isBefore(d.date, new Date()) && !isToday(d.date)),
    pastDeadlines: deadlines.filter(d => isBefore(d.date, new Date()) && !isToday(d.date)),
    todayDeadlines: deadlines.filter(d => isToday(d.date))
  };
};