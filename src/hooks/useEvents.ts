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
        setLoading(false); // Ensure loading is set to false
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
  
  const updateEventStatus = async (eventId: string, status: Event['status']) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId)
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
    // Correctly get the subscription object
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('useEvents: Auth state changed, event:', event);
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        console.log('useEvents: SIGNED_IN or INITIAL_SESSION, fetching events.');
        if (session) fetchEvents(); // Fetch events only if there's a session
        else setEvents([]); // Clear events if no session
      } else if (event === 'SIGNED_OUT') {
        console.log('useEvents: SIGNED_OUT, clearing events.');
        setEvents([]);
      }
    });

    // Initial check for session and fetch events
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('useEvents (initial check): Session state:', session ? 'Exists' : 'Null');
      if (session) {
        fetchEvents();
      } else {
        setEvents([]); // Ensure events are cleared if no initial session
      }
    });

    // Cleanup function
    return () => {
      subscription?.unsubscribe();
      console.log('useEvents: Unsubscribed from auth state changes.');
    };
  }, [fetchEvents]); // fetchEvents is memoized with useCallback

  return { events, loading, addEvent, fetchEvents, updateEventStatus };
};