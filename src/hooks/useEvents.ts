import { useState, useEffect, useCallback } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // Guard for concurrent fetches

  const fetchEvents = useCallback(async () => {
    if (isFetching) {
      console.log('useEvents: fetchEvents already in progress, skipping.');
      return;
    }
    console.log('useEvents: fetchEvents called');
    setLoading(true);
    setIsFetching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('useEvents: No user found, clearing events.');
        setEvents([]);
        // setLoading(false); // setLoading will be handled in finally
        // setIsFetching(false); // setIsFetching will be handled in finally
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
      setIsFetching(false);
      console.log('useEvents: fetchEvents finished');
    }
  }, [isFetching]); // Added isFetching to useCallback dependencies

  const addEvent = async (eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'status'>) => {
    setLoading(true); // Keep outer loading for the specific action
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
      await fetchEvents(); // This will now be guarded
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
    setLoading(true); // Keep outer loading for the specific action
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      showSuccess('Stato evento aggiornato!');
      await fetchEvents(); // This will now be guarded
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
        console.log('useEvents: SIGNED_IN or INITIAL_SESSION, attempting to fetch events.');
        if (session) {
          fetchEvents();
        } else {
          // No session on INITIAL_SESSION or error during SIGNED_IN
          setEvents([]);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('useEvents: SIGNED_OUT, clearing events.');
        setEvents([]);
      }
    });

    // The explicit supabase.auth.getSession() call here was redundant
    // because onAuthStateChange fires an 'INITIAL_SESSION' event on subscription.
    // Removing it prevents a double fetch on initial load.

    return () => {
      subscription?.unsubscribe();
      console.log('useEvents: Unsubscribed from auth state changes.');
    };
  }, [fetchEvents]);

  return { events, loading, addEvent, fetchEvents, updateEventStatus };
};