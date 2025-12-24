import { parseISO, subDays, isBefore, isToday, addDays, startOfDay, isFuture } from 'date-fns';
import { Event } from '@/types';
import { Deadline } from '@/types';

const calculateDeadlinesForEvent = (event: Event): Deadline[] => {
  const eventDeadlines: Deadline[] = [];
  if (!event.start_date) return [];
  
  // Normalizziamo le date di inizio e fine evento a mezzanotte locale per calcoli coerenti
  const startDate = startOfDay(parseISO(event.start_date));
  const endDate = event.end_date ? startOfDay(parseISO(event.end_date)) : startDate;

  if (event.type === 'E-learning') {
    // Scadenze per corsi E-learning
    eventDeadlines.push({
      type: 'discenti_elearning',
      date: startOfDay(subDays(startDate, 8)),
      message: `Richiesta discenti (E-learning) per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_discenti_elearning_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'comunicazione_scuola',
      date: startOfDay(subDays(startDate, 7)),
      message: `Comunicazione alla Scuola PEF/Altro per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('comunicazione_scuola_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'lettera_abilitazione',
      date: startOfDay(subDays(startDate, 1)),
      message: `Lettera Abilitazione al Corso per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('lettera_abilitazione_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'mail_sollecito_1',
      date: startOfDay(addDays(startDate, 15)),
      message: `Prima mail di sollecito per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('mail_sollecito_1_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'mail_sollecito_2',
      date: startOfDay(addDays(startDate, 25)),
      message: `Seconda mail di sollecito per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('mail_sollecito_2_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'avviso_proroga',
      date: startOfDay(addDays(endDate, 1)),
      message: `Avviso Proroga (eventuale) per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('avviso_proroga_fatto') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'relazione_finale',
      date: startOfDay(addDays(startDate, 30)),
      message: `Relazione Finale per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('relazione_finale_fatta') || false,
      eventTitle: event.title,
    });

  } else {
    // Scadenze per corsi standard
    eventDeadlines.push({
      type: 'docente',
      date: startOfDay(subDays(startDate, 30)),
      message: `Richiesta docenti per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_docente_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'discenti_standard',
      date: startOfDay(subDays(startDate, 25)),
      message: `Creare richiesta discenti per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_discenti_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'avvio_standard',
      date: startOfDay(subDays(startDate, 10)),
      message: `Preparare Avvio Corso per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('avvio_corso_fatto') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'giorno_evento_registri',
      date: startDate, // Già normalizzata sopra
      message: `Gestire registri per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('gestione_registri_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'post_evento_feedback',
      date: startOfDay(addDays(endDate, 1)),
      message: `Raccogliere feedback per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('raccolta_feedback_fatta') || false,
      eventTitle: event.title,
    });

    eventDeadlines.push({
      type: 'post_evento_modello_l',
      date: startOfDay(addDays(endDate, 2)),
      message: `Generare Modello L per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('generazione_modello_l_fatta') || false,
      eventTitle: event.title,
    });
  }

  // Aggiungi la scadenza dalla checklist se presente
  if (event.completed_tasks && Array.isArray(event.completed_tasks)) {
    const risposteTask = event.completed_tasks.find(task => 
      typeof task === 'string' && task.startsWith('checklist_risposte_reparti_entro:')
    );
    if (risposteTask) {
      const dateString = risposteTask.split(':')[1];
      if (dateString) {
        try {
          // Usiamo parseISO per interpretare la stringa YYYY-MM-DD come data UTC a mezzanotte,
          // e poi la normalizziamo a mezzanotte locale con startOfDay.
          // Questo è più sicuro che usare il costruttore Date con numeri.
          const deadlineDate = startOfDay(parseISO(dateString)); 
          
          eventDeadlines.push({
            type: 'risposte_reparti',
            date: deadlineDate, // Data normalizzata
            message: `Risposte dei Reparti per "${event.title}"`,
            eventId: event.id,
            completed: false, // Questa scadenza è solo una notifica
            eventTitle: event.title,
          });
        } catch (e) {
          console.error(`[useDeadlines] Formato data non valido per la scadenza della checklist: ${dateString}`, e);
        }
      }
    }
  }

  return eventDeadlines;
};

export const useDeadlines = (events: Event[]) => {
  const deadlines = events.flatMap(calculateDeadlinesForEvent);
  
  // Normalizza la data odierna per il confronto
  const todayNormalized = startOfDay(new Date());

  return {
    deadlines,
    // Upcoming: non completate, non oggi, e nel futuro
    upcomingDeadlines: deadlines.filter(d => 
      !d.completed && 
      !isToday(d.date) &&
      isFuture(d.date)
    ),
    // Past: non completate e prima di oggi (usiamo todayNormalized per un confronto rigoroso a mezzanotte)
    pastDeadlines: deadlines.filter(d => 
      !d.completed && 
      isBefore(d.date, todayNormalized)
    ),
    // Today: non completate e oggi
    todayDeadlines: deadlines.filter(d => 
      !d.completed && 
      isToday(d.date)
    )
  };
};