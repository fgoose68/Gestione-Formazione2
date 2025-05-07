import { useState, useEffect } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

export const useEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      showError('Errore nel caricamento eventi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: any) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      showSuccess('Evento creato con successo!');
      return data;
    } catch (error) {
      showError('Errore nel salvataggio evento');
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, addEvent, fetchEvents };
};