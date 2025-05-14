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
      console.log('useEvents: Events fetched successfully:', data);
      setEvents(data || []);
    } catch (error: any) {
      showError(`Errore nel caricamento eventi: ${error.message}`);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Utente non autenticato.');
        return null;
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          user_id: user.id,
          status: 'in_preparazione',
        })
        .select()
        .single();

      if (error) throw error;
      showSuccess('Evento creato con successo!');
      await fetchEvents();
      return data as Event;
    } catch (error: any) {
      showError(`Errore nel salvataggio evento: ${error.message}`);
      console.error("useEvents: Errore addEvent:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Nuova funzione per aggiornare un evento esistente
  const updateEvent = async (eventId: string, eventData: Partial<Omit<Event, 'user_id' | 'created_at'>>) => {
     setLoading(true);
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
         showError('Utente non autenticato.');
         return null;
       }

       // Assicurati di non sovrascrivere user_id o created_at
       const { user_id, created_at, ...dataToUpdate } = eventData;

       const { data, error } = await supabase
         .from('events')
         .update(dataToUpdate)
         .eq('id', eventId)
         .eq('user_id', user.id) // Assicura che l'utente possa modificare solo i propri eventi
         .select()
         .single();

       if (error) throw error;
       showSuccess('Evento aggiornato con successo!');
       await fetchEvents(); // Ricarica gli eventi dopo l'aggiornamento
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
      const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
         showError('Utente non autenticato.');
         return null;
       }
      const { data, error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId)
        .eq('user_id', user.id) // Assicura che l'utente possa modificare solo i propri eventi
        .select()
        .single();

      if (error) throw error;
      showSuccess('Stato evento aggiornato!');
      await fetchEvents();
      return data as Event;
    } catch (error: any) {
      showError(`Errore aggiornamento stato: ${error.message}`);
      return null;
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

  return { events, loading, addEvent, fetchEvents, updateEventStatus, updateEvent }; // Esporta updateEvent
};