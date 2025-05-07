import { useState, useEffect } from 'react';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { Event } from '@/types';

export const useDeadlines = (events: Event[]) => {
  const [deadlines, setDeadlines] = useState<any[]>([]);

  const calculateDeadlines = (event: Event) => {
    const deadlines = [];
    const startDate = new Date(event.start_date);
    
    // 30 giorni prima
    deadlines.push({
      type: 'docente',
      date: new Date(startDate.setDate(startDate.getDate() - 30)),
      message: 'Redigere documento richiesta docenti',
      eventId: event.id,
      completed: false
    });

    // 25 giorni prima
    deadlines.push({
      type: 'discenti',
      date: new Date(startDate.setDate(startDate.getDate() + 5)), // 30-5=25
      message: 'Creare documento richiesta discenti',
      eventId: event.id,
      completed: false
    });

    // 10 giorni prima
    deadlines.push({
      type: 'avvio',
      date: new Date(startDate.setDate(startDate.getDate() + 15)), // 25+15=10
      message: 'Documento di Avvio Corso',
      eventId: event.id,
      completed: false
    });

    return deadlines;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  const checkDeadlines = () => {
    const allDeadlines = events.flatMap(event => calculateDeadlines(event));
    const today = new Date();
    
    // Filtra scadenze imminenti (oggi o future)
    const upcoming = allDeadlines.filter(d => d.date >= today);
    
    // Ordina per data
    upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    setDeadlines(upcoming);

    // Mostra notifiche per scadenze oggi
    allDeadlines.forEach(deadline => {
      if (isSameDay(deadline.date, today) && !deadline.completed) {
        showLoading(`Scadenza: ${deadline.message}`);
      }
    });
  };

  useEffect(() => {
    if (events.length > 0) {
      checkDeadlines();
      
      // Controlla scadenze ogni giorno
      const interval = setInterval(checkDeadlines, 86400000); // 24 ore
      return () => clearInterval(interval);
    }
  }, [events]);

  return { deadlines };
};