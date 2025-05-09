import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';

export const useEvent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const getEventById = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your existing hook functions

  return {
    getEventById,
    // ... other functions
  };
};