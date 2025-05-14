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
      // Rimosso il controllo sull'utente. La query potrebbe fallire se RLS lo richiede.
      const { data, error } = await supabase
        .from('events')
        // Rimosso .eq('user_id', user.id) per tentare di caricare tutti gli eventi
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('useEvents: Error fetching events:', error);
        // Mostra un errore generico se il fetch fallisce (es. per RLS)
        showError(`Errore nel caricamento eventi: ${error.message}`);
        throw error;
      }
      console.log('useEvents: Events fetched successfully:', data);
      setEvents(data || []);
    } catch (error: any) {
      // L'errore specifico "Utente non autenticato" non viene più mostrato qui
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
      // Tentiamo di ottenere l'utente, ma non blocchiamo se non c'è.
      // Supabase RLS potrebbe bloccare l'operazione se user_id è richiesto.
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null; // Usa null se l'utente non è autenticato

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
      // L'errore specifico "Utente non autenticato" non viene più mostrato qui
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
      // Rimosso il controllo sull'utente. La query potrebbe fallire se RLS lo richiede.
      const { data, error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId)
        // Rimosso .eq('user_id', user.id) per tentare l'aggiornamento indipendentemente dall'utente loggato
        .select()
        .single();

      if (error) throw error;
      showSuccess('Stato evento aggiornato!');
      await fetchEvents(); // Aggiorna la lista dopo l'aggiornamento
      return data as Event;
    } catch (error: any) {
      // L'errore specifico "Utente non autenticato" non viene più mostrato qui
      showError(`Errore aggiornamento stato: ${error.message}`);
      console.error("useEvents: Errore updateEventStatus:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEvents: useEffect for initial fetch triggered');
    // Esegui il fetch iniziale all'avvio, indipendentemente dallo stato di autenticazione
    fetchEvents();

    // Rimosso il listener onAuthStateChange poiché l'app non dipende più dallo stato di autenticazione per il fetch iniziale.
    // Se in futuro volessi reintrodurre logiche basate sull'utente, dovrai riaggiungerlo.

    // Non c'è più una subscription da pulire se rimuoviamo onAuthStateChange
    // return () => { subscription?.unsubscribe(); };
  }, [fetchEvents]); // fetchEvents è memoized con useCallback

  return { events, loading, addEvent, fetchEvents, updateEventStatus };
};