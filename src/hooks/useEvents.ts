import { useState, useEffect, useCallback } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';
import { getEventDisplayStatus } from '@/utils/eventStatus'; // Importa la nuova utility

// Definisci il tipo di ritorno dello hook per maggiore chiarezza
interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  addEvent: (eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'status' | 'displayStatus'>) => Promise<Event | null>;
  fetchEvents: () => Promise<void>;
  updateEventStatus: (eventId: string, status: Event['status']) => Promise<Event | null>;
  updateEvent: (eventId: string, eventData: Partial<Omit<Event, 'user_id' | 'created_at' | 'displayStatus'>>) => Promise<Event | null>;
  deleteEvent: (eventId: string) => Promise<boolean>;
}

export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    console.log('useEvents: fetchEvents called');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('useEvents: No user found, clearing events.');
        setEvents([]);
        setLoading(false);
        return;
      }
      console.log('useEvents: User found, fetching events for user_id:', user.id);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('useEvents: Error fetching events:', error);
        throw error;
      }
      
      // Mappa gli eventi per aggiungere il displayStatus
      const eventsWithDisplayStatus: Event[] = (data || []).map(event => ({
        ...event,
        displayStatus: getEventDisplayStatus(event),
      }));

      console.log('useEvents: Events fetched successfully with displayStatus:', eventsWithDisplayStatus);
      setEvents(eventsWithDisplayStatus);
    } catch (error: any) {
      showError(`Errore nel caricamento eventi: ${error.message}`);
      console.error("useEvents: Errore fetchEvents:", error);
      setEvents([]);
    } finally {
      setLoading(false);
      console.log('useEvents: fetchEvents finished, loading set to false');
    }
  }, []);

  const addEvent = async (eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'status' | 'displayStatus'>) => {
    setLoading(true);
    try {
      const { data: { user } = {} } = await supabase.auth.getUser();
      if (!user) {
        showError('Utente non autenticato.');
        return null;
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          user_id: user.id,
          status: 'in_preparazione', // Nuovo evento inizia sempre 'in_preparazione'
        })
        .select()
        .single();

      if (error) throw error;
      showSuccess('Evento creato con successo!');
      await fetchEvents(); // Ricarica gli eventi per aggiornare la UI con il nuovo displayStatus
      return data as Event;
    } catch (error: any) {
      showError(`Errore nel salvataggio evento: ${error.message}`);
      console.error("useEvents: Errore addEvent:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const updateEvent = async (eventId: string, eventData: Partial<Omit<Event, 'user_id' | 'created_at' | 'displayStatus'>>) => {
     setLoading(true);
     try {
       const { data: { user } = {} } = await supabase.auth.getUser();
       if (!user) {
         showError('Utente non autenticato.');
         return null;
       }

       // Assicurati di non sovrascrivere user_id, created_at o displayStatus
       const { user_id, created_at, displayStatus, ...dataToUpdate } = eventData;

       const { data, error } = await supabase
         .from('events')
         .update(dataToUpdate)
         .eq('id', eventId)
         .eq('user_id', user.id) // Assicura che l'utente possa modificare solo i propri eventi
         .select()
         .single();

       if (error) throw error;
       showSuccess('Evento aggiornato con successo!');
       await fetchEvents(); // Ricarica gli eventi dopo l'aggiornamento per ricalcolare displayStatus
       return data as Event;
     } catch (error: any) {
       showError(`Errore nell'aggiornamento evento: ${error.message}`);
       console.error("useEvents: Errore updateEvent:", error);
       return null;
     } finally {
       setLoading(false);
     }
  };


  const updateEventStatus = async (eventId: string, status: Event['status']) => {
    setLoading(true);
    try {
      const { data: { user } = {} } = await supabase.auth.getUser(); // Aggiunto default {}
       if (!user) {
         showError('Utente non autenticato.');
         return null;
       }
      const { data, error } = await supabase
        .from('events')
        .update({ status }) // Aggiorna lo stato nel DB
        .eq('id', eventId)
        .eq('user_id', user.id) // Assicura che l'utente possa modificare solo i propri eventi
        .select()
        .single();

      if (error) throw error;
      showSuccess('Stato evento aggiornato!');
      await fetchEvents(); // Ricarica per aggiornare il displayStatus
      return data as Event;
    } catch (error: any) {
      showError(`Errore aggiornamento stato: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteEvent = async (eventId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { user } = {} } = await supabase.auth.getUser(); // Aggiunto default {}
      if (!user) {
        showError('Utente non autenticato.');
        return false;
      }

      // Elimina prima i discenti associati all'evento
      const { error: deleteAttendeesError } = await supabase
        .from('department_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id); // Assicura che l'utente possa eliminare solo i propri dati

      if (deleteAttendeesError) {
        console.error("useEvents: Errore eliminazione discenti:", deleteAttendeesError);
        throw deleteAttendeesError; // Propaga l'errore
      }
      
      // Elimina anche le relazioni in event_instructors e event_participants se esistono
       const { error: deleteEventInstructorsError } = await supabase
        .from('event_instructors')
        .delete()
        .eq('event_id', eventId); // RLS dovrebbe gestire il controllo utente tramite la policy su event_instructors

       if (deleteEventInstructorsError) {
         console.error("useEvents: Errore eliminazione event_instructors:", deleteEventInstructorsError);
         throw deleteEventInstructorsError;
       }

       const { error: deleteEventParticipantsError } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId); // RLS dovrebbe gestire il controllo utente tramite la policy su event_participants

       if (deleteEventParticipantsError) {
         console.error("useEvents: Errore eliminazione event_participants:", deleteEventParticipantsError);
         throw deleteEventParticipantsError;
       }


      // Ora elimina l'evento principale
      const { error: deleteEventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id); // Assicura che l'utente possa eliminare solo i propri eventi

      if (deleteEventError) {
        console.error("useEvents: Errore eliminazione evento:", deleteEventError);
        throw deleteEventError; // Propaga l'errore
      }

      showSuccess('Evento eliminato con successo!');
      await fetchEvents(); // Ricarica gli eventi dopo l'eliminazione
      return true;

    } catch (error: any) {
      showError(`Errore nell'eliminazione evento: ${error.message}`);
      console.error("useEvents: Errore deleteEvent:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    console.log('useEvents: useEffect for auth state change triggered');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('useEvents: Auth state changed, event:', event);
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        console.log('useEvents: SIGNED_IN or INITIAL_SESSION, fetching events.');
        if (session) fetchEvents();
        else setEvents([]);
      } else if (event === 'SIGNED_OUT') {
        console.log('useEvents: SIGNED_OUT, clearing events.');
        setEvents([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('useEvents (initial check): Session state:', session ? 'Exists' : 'Null');
      if (session) {
        fetchEvents();
      } else {
        setEvents([]);
      }
    });

    return () => {
      subscription?.unsubscribe();
      console.log('useEvents: Unsubscribed from auth state changes.');
    };
  }, [fetchEvents]);

  // Aggiungi un controllo prima di restituire le funzioni
  const hookReturn: UseEventsReturn = {
    events,
    loading,
    addEvent,
    fetchEvents,
    updateEventStatus,
    updateEvent,
    deleteEvent,
  };

  // Verifica che le funzioni critiche siano definite
  if (typeof hookReturn.addEvent !== 'function') console.error("useEvents: addEvent is not a function!");
  if (typeof hookReturn.fetchEvents !== 'function') console.error("useEvents: fetchEvents is not a function!");
  if (typeof hookReturn.updateEventStatus !== 'function') console.error("useEvents: updateEventStatus is not a function!");
  if (typeof hookReturn.updateEvent !== 'function') console.error("useEvents: updateEvent is not a function!");
  if (typeof hookReturn.deleteEvent !== 'function') console.error("useEvents: deleteEvent is not a function!");


  return hookReturn;
};