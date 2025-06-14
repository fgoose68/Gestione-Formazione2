import { parseISO, isPast, isToday, isFuture, addDays, isWithinInterval } from 'date-fns';
import { Event } from '@/types';

/**
 * Calcola lo stato di visualizzazione di un evento basandosi sulle sue date e sullo stato del database.
 * @param event L'oggetto evento.
 * @returns Lo stato di visualizzazione ('concluso', 'in_corso', 'in_programma', 'archiviato').
 */
export const getEventDisplayStatus = (event: Event): Event['displayStatus'] => {
  // Se l'evento è archiviato nel database, il suo stato di visualizzazione è 'archiviato'.
  if (event.status === 'archiviato') {
    return 'archiviato';
  }

  const startDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizza la data odierna all'inizio del giorno per confronti consistenti

  // 1. Concluso: Se la data di fine è oggi o nel passato.
  if (isPast(endDate) || isToday(endDate)) {
    return 'concluso';
  }

  // 2. In programma: Se la data di inizio è nel futuro.
  if (isFuture(startDate)) {
    return 'in_programma';
  }

  // 3. In corso: Se non è concluso e non è in programma, significa che è iniziato e non è ancora finito.
  //    Questo copre sia gli eventi che terminano a breve che quelli a lungo termine.
  return 'in_corso';
};

/**
 * Verifica se un evento 'in_corso' sta per terminare (entro i prossimi 7 giorni).
 * @param event L'oggetto evento.
 * @returns True se l'evento termina entro 7 giorni, false altrimenti.
 */
export const isEventEndingSoon = (event: Event): boolean => {
  const endDate = parseISO(event.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = addDays(today, 7);
  sevenDaysFromNow.setHours(23, 59, 59, 999); // Includi la fine del settimo giorno

  // L'evento deve essere 'in_corso' e la sua data di fine deve essere entro i prossimi 7 giorni (incluso oggi).
  return (getEventDisplayStatus(event) === 'in_corso') && (isWithinInterval(endDate, { start: today, end: sevenDaysFromNow }));
};