// ... (codice precedente rimane invariato)

const calculateDeadlinesForEvent = (event: Event): Deadline[] => {
  const eventDeadlines: Deadline[] = [];
  if (!event.start_date) return [];
  
  const startDate = parseISO(event.start_date);
  const endDate = event.end_date ? parseISO(event.end_date) : startDate;

  if (event.type === 'E-learning') {
    // Scadenze per corsi E-learning
    
    // Richiesta Discenti: 8 giorni prima (modificato da 5 a 8)
    eventDeadlines.push({
      type: 'discenti_elearning',
      date: subDays(startDate, 8), // Modificato da 5 a 8
      message: `Richiesta discenti (E-learning) per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('richiesta_discenti_elearning_fatta') || false,
      eventTitle: event.title,
    });

    // Comunicazione alla Scuola PEF/Altro: 7 giorni prima (modificato da 3 a 7)
    eventDeadlines.push({
      type: 'comunicazione_scuola',
      date: subDays(startDate, 7), // Modificato da 3 a 7
      message: `Comunicazione alla Scuola PEF/Altro per "${event.title}"`,
      eventId: event.id,
      completed: event.completed_tasks?.includes('comunicazione_scuola_fatta') || false,
      eventTitle: event.title,
    });

    // ... (resto del codice rimane invariato)
  } else {
    // ... (codice per altri tipi di corso rimane invariato)
  }

  return eventDeadlines;
};

// ... (codice successivo rimane invariato)