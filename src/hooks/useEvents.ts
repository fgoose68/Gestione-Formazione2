import { useState, useEffect, useCallback } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEvents([]);
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      showError(`Errore nel caricamento eventi: ${error.message}`);
      console.error("Errore fetchEvents:", error);
      setEvents([]);
    } finally {
      setLoading(false);
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
      console.error("Errore addEvent:", error);
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
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchEvents();
      } else if (event === 'SIGNED_OUT') {
        setEvents([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchEvents();
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [fetchEvents]);

  return { events, loading, addEvent, fetchEvents, updateEventStatus };
};