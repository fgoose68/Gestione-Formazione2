import { useState, useEffect, useCallback, useRef } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';

type UpdatableEventData = Partial<Omit<Event, 'id' | 'user_id' | 'created_at' | 'status' | 'completed_tasks'>>;

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false); // For general loading state of events list
  // const [isFetching, setIsFetching] = useState(false); // Replaced by isFetchingRef
  const isFetchingRef = useRef(false); // To prevent concurrent fetchEvents calls

  const fetchEvents = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('useEvents: fetchEvents already in progress (ref check), skipping.');
      return;
    }
    console.log('useEvents: fetchEvents called');
    isFetchingRef.current = true;
    setLoading(true); 
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('useEvents: No user found, clearing events.');
        setEvents([]);
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
      isFetchingRef.current = false;
      console.log('useEvents: fetchEvents finished');
    }
  }, []); // Empty dependency array makes fetchEvents stable

  const addEvent = async (eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'status' | 'completed_tasks'>) => {
    // setLoading(true); // Action-specific loading, can be handled by a different state if needed
                      // or rely on fetchEvents's loading state if UI reflects general list loading
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
      // setLoading(false);
    }
  };
  
  const updateEvent = async (eventId: string, eventData: UpdatableEventData) => {
    // setLoading(true); // Action-specific loading
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Utente non autenticato.');
        return null;
      }
      const dataToUpdate = { ...eventData };
      if ('user_id' in dataToUpdate) delete (dataToUpdate as any).user_id;
      if ('id' in dataToUpdate) delete (dataToUpdate as any).id;
      if ('created_at' in dataToUpdate) delete (dataToUpdate as any).created_at;

      const { data, error } = await supabase
        .from('events')
        .update(dataToUpdate)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      showSuccess('Evento aggiornato con successo!');
      await fetchEvents();
      return data as Event;
    } catch (error: any) {
      showError(`Errore nell'aggiornamento dell'evento: ${error.message}`);
      console.error("useEvents: Errore updateEvent:", error);
      return null;
    } finally {
      // setLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, status: Event['status']) => {
    // setLoading(true); // Action-specific loading
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
      // setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEvents: Subscribing to onAuthStateChange.');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('useEvents: Auth state changed, event:', event);
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session) {
          fetchEvents(); // fetchEvents is now stable
        } else {
          setEvents([]);
        }
      } else if (event === 'SIGNED_OUT') {
        setEvents([]);
      }
    });

    return () => {
      console.log('useEvents: Unsubscribing from onAuthStateChange.');
      subscription?.unsubscribe();
    };
  }, [fetchEvents]); // fetchEvents is stable, so this effect runs once per component lifecycle using the hook

  return { events, loading, addEvent, fetchEvents, updateEventStatus, updateEvent };
};