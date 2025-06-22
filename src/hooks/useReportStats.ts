import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event, DepartmentAttendee } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getEventDisplayStatus } from '@/utils/eventStatus';
import { COURSE_TYPES } from '@/constants/courseTypes';
import { DateRange } from 'react-day-picker';

interface ReportStats {
  reportEvents: Event[];
  reportAttendees: DepartmentAttendee[];
  reportLoading: boolean;
  reportStatsByType: { [key: string]: { count: number; totalActual: number } };
  fetchReportData: () => Promise<void>;
}

export const useReportStats = (reportDateRange: DateRange | undefined): ReportStats => {
  const [reportEvents, setReportEvents] = useState<Event[]>([]);
  const [reportAttendees, setReportAttendees] = useState<DepartmentAttendee[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchReportData = useCallback(async () => {
    if (!reportDateRange?.from || !reportDateRange?.to) {
      setReportEvents([]);
      setReportAttendees([]);
      return;
    }

    setReportLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setReportEvents([]);
        setReportAttendees([]);
        setReportLoading(false);
        return;
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*, type')
        .eq('user_id', user.id)
        .neq('status', 'archiviato')
        .gte('start_date', reportDateRange.from.toISOString())
        .lte('end_date', reportDateRange.to.toISOString())
        .order('start_date', { ascending: true });

      if (eventsError) throw eventsError;

      const filteredReportEvents = (eventsData || []).map(event => ({
        ...event,
        displayStatus: getEventDisplayStatus(event),
      }));
      setReportEvents(filteredReportEvents);

      if (filteredReportEvents.length > 0) {
        const eventIds = filteredReportEvents.map(event => event.id);
        const { data: attendeesData, error: attendeesError } = await supabase
          .from('department_attendees')
          .select('*')
          .in('event_id', eventIds)
          .eq('user_id', user.id);

        if (attendeesError) throw attendeesError;
        setReportAttendees(attendeesData || []);
      } else {
        setReportAttendees([]);
      }

    } catch (err: any) {
      toast({
        title: "Errore",
        description: `Errore caricamento dati report: ${err.message}`,
        variant: "destructive",
      });
      console.error("Errore fetchReportData:", err);
      setReportEvents([]);
      setReportAttendees([]);
    } finally {
      setReportLoading(false);
    }
  }, [reportDateRange]); // Dipendenza da reportDateRange per rifetchare al cambio del range

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Calcola statistiche per tipo di corso (per il report)
  const reportStatsByType = useMemo(() => {
    const typeStats: { [key: string]: { count: number; totalActual: number } } = {};

    [...COURSE_TYPES, 'Non Specificato'].forEach(type => {
       if (type) {
         typeStats[type] = { count: 0, totalActual: 0 };
       }
    });

    reportEvents.forEach(event => {
      const type = event.type || 'Non Specificato';
      if (!typeStats[type]) {
         typeStats[type] = { count: 0, totalActual: 0 };
      }
      typeStats[type].count++;

      const eventAttendees = reportAttendees.filter(att => att.event_id === event.id);
      const eventTotalActual = eventAttendees.reduce((total, att) => total + (att.actual || 0), 0);
      typeStats[type].totalActual += eventTotalActual;
    });

    return typeStats;
  }, [reportEvents, reportAttendees]);

  return {
    reportEvents,
    reportAttendees,
    reportLoading,
    reportStatsByType,
    fetchReportData,
  };
};