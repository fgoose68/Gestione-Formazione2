import { useState, useEffect, useCallback } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    console.log('useEvents: fetchEvents called');
    setLoading(true);
    try {
      // Con RLS impostato su TRUE, questa query dovrebbe funzionare anche senza autenticazione.
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('useEvents: Error fetching events:', error);
        showError(`Errore nel caricamento eventi: ${error.message}`);
        throw error;
      }
      console.log('useEvents: Events fetched successfully:', data);
      setEvents(data || []);
    } catch (error: any) {
      console.error("useEvents: Errore fetchEvents:", error);
      setEvents([]);
    } finally {
      setLoading(false);
      console.log('useEvents: fetchEvents finished, loading set to false');
    }
  }, []);

  const addEvent = async (eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'status'>) => {
    setLoading(true);
    try {
      // Ottiene l'utente autenticato se presente, altrimenti user.id sarà null.
      // Questo è gestito dalle policy RLS impostate su TRUE.
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          user_id: userId, // Inserisce l'ID utente se disponibile, altrimenti null
          status: 'in_preparazione',
        })
        .select()
        .single();

      if (error) throw error;
      showSuccess('Evento creato con successo!');
      await fetchEvents(); // Aggiorna la lista dopo l'aggiunta
      return data as Event;
    } catch (error: any) {
      showError(`Errore nel salvataggio evento: ${error.message}`);
      console.error("useEvents: Errore addEvent:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const updateEventStatus = async (eventId: string, status: Event['status']) => {
    setLoading(true);
    try {
      // Con RLS impostato su TRUE, questa query dovrebbe funzionare anche senza autenticazione.
      const { data, error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId)
        // Non è necessario filtrare per user_id se RLS è TRUE
        .select()
        .single();

      if (error) throw error;
      showSuccess('Stato evento aggiornato!');
      await fetchEvents(); // Aggiorna la lista dopo l'aggiornamento
      return data as Event;
    } catch (error: any) {
      showError(`Errore aggiornamento stato: ${error.message}`);
      console.error("useEvents: Errore updateEventStatus:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    setLoading(true);
    try {
      // Elimina prima i discenti associati
      const { error: deleteAttendeesError } = await supabase
        .from('department_attendees')
        .delete()
        .eq('event_id', eventId);

      if (deleteAttendeesError) {
        console.error('useEvents: Error deleting attendees:', deleteAttendeesError);
        // Non bloccare l'eliminazione dell'evento se fallisce l'eliminazione dei discenti,
        // ma mostra un avviso.
        showError(`Errore nell'eliminazione dei discenti associati: ${deleteAttendeesError.message}`);
      }

      // Poi elimina l'evento
      const { error: deleteEventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteEventError) {
        console.error('useEvents: Error deleting event:', deleteEventError);
        throw deleteEventError; // Lancia l'errore per bloccare l'operazione se l'evento non viene eliminato
      }

      showSuccess('Evento eliminato con successo!');
      await fetchEvents(); // Aggiorna la lista dopo l'eliminazione
      return true; // Indica successo
    } catch (error: any) {
      showError(`Errore nell'eliminazione evento: ${error.message}`);
      console.error("useEvents: Errore deleteEvent:", error);
      return false; // Indica fallimento
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    console.log('useEvents: useEffect for initial fetch triggered');
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, addEvent, fetchEvents, updateEventStatus, deleteEvent };
};