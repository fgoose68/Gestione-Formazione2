import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event, DepartmentAttendee } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { DEFAULT_DEPARTMENTS } from '@/constants/departments';
import { getEventDisplayStatus } from '@/utils/eventStatus';
import { COURSE_TYPES } from '@/constants/courseTypes';

interface MonthlyStats {
  events: Event[];
  attendees: DepartmentAttendee[];
  loading: boolean;
  totalCoursesMonth: number;
  totalActualAttendeesMonth: number;
  statsByType: { [key: string]: { count: number; totalActual: number } };
  monthlyDepartmentRankTotals: {
    department_name: string;
    officers: number;
    inspectors: number;
    superintendents: number;
    militari: number;
    actualTotal: number;
  }[];
  monthlyDepartmentRankGrandTotals: {
    officers: number;
    inspectors: number;
    superintendents: number;
    militari: number;
    actualTotal: number;
  };
  attendeesByEvent: Map<string, DepartmentAttendee[]>;
  fetchStats: () => Promise<void>;
}

export const useMonthlyStats = (currentMonth: Date): MonthlyStats => {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<DepartmentAttendee[]>([]);
  const [loading, setLoading] = useState(true);

  const startOfCurrentMonth = startOfMonth(currentMonth);
  const endOfCurrentMonth = endOfMonth(currentMonth);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         setEvents([]);
         setAttendees([]);
         setLoading(false);
         return;
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*, type')
        .eq('user_id', user.id)
        .neq('status', 'archiviato')
        .order('start_date', { ascending: true });

      if (eventsError) throw eventsError;

      const monthlyEvents = (eventsData || [])
        .filter(event => {
          const startDate = parseISO(event.start_date);
          return isWithinInterval(startDate, { start: startOfCurrentMonth, end: endOfCurrentMonth });
        })
        .map(event => ({
          ...event,
          displayStatus: getEventDisplayStatus(event),
        }));

      setEvents(monthlyEvents || []);

      if (monthlyEvents.length > 0) {
         const eventIds = monthlyEvents.map(event => event.id);
         const { data: attendeesData, error: attendeesError } = await supabase
           .from('department_attendees')
           .select('*')
           .in('event_id', eventIds)
           .eq('user_id', user.id);

         if (attendeesError) throw attendeesError;
         setAttendees(attendeesData || []);
      } else {
         setAttendees([]);
      }

    } catch (err: any) {
      toast({
        title: "Errore",
        description: `Errore caricamento statistiche mensili: ${err.message}`,
        variant: "destructive",
      });
      console.error("Errore fetchStatsData (monthly):", err);
      setEvents([]);
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]); // Dipendenza da currentMonth per rifetchare al cambio mese

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Calcola statistiche aggregate per il mese corrente
  const totalCoursesMonth = events.length;
  const totalActualAttendeesMonth = useMemo(() => {
    return attendees.reduce((total, att) => total + (att.actual || 0), 0);
  }, [attendees]);

  // Calcola statistiche per tipo di corso (per il mese corrente)
  const statsByType = useMemo(() => {
    const typeStats: { [key: string]: { count: number; totalActual: number } } = {};

    [...COURSE_TYPES, 'Non Specificato'].forEach(type => {
       if (type) {
         typeStats[type] = { count: 0, totalActual: 0 };
       }
    });

    events.forEach(event => {
      const type = event.type || 'Non Specificato';
      if (!typeStats[type]) {
         typeStats[type] = { count: 0, totalActual: 0 };
      }
      typeStats[type].count++;

      const eventAttendees = attendees.filter(att => att.event_id === event.id);
      const eventTotalActual = eventAttendees.reduce((total, att) => total + (att.actual || 0), 0);
      typeStats[type].totalActual += eventTotalActual;
    });

    return typeStats;
  }, [events, attendees]);

  // NUOVA AGGREGAZIONE: Totali effettivi per Reparto e Grado nel mese
  const monthlyDepartmentRankTotals = useMemo(() => {
    const totalsMap: {
      [key: string]: {
        department_name: string;
        officers: number;
        inspectors: number;
        superintendents: number;
        militari: number;
        actualTotal: number;
      };
    } = {};

    DEFAULT_DEPARTMENTS.forEach(deptName => {
        totalsMap[deptName] = {
            department_name: deptName,
            officers: 0,
            inspectors: 0,
            superintendents: 0,
            militari: 0,
            actualTotal: 0,
        };
    });

    attendees.forEach(att => {
      const deptName = att.department_name;
      if (!totalsMap[deptName]) {
           totalsMap[deptName] = {
              department_name: deptName,
              officers: 0,
              inspectors: 0,
              superintendents: 0,
              militari: 0,
              actualTotal: 0,
           };
      }

      totalsMap[deptName].officers += att.officers || 0;
      totalsMap[deptName].inspectors += att.inspectors || 0;
      totalsMap[deptName].superintendents += att.superintendents || 0;
      totalsMap[deptName].militari += att.militari || 0;
      totalsMap[deptName].actualTotal += att.actual || 0;
    });

    return DEFAULT_DEPARTMENTS.map(deptName => totalsMap[deptName]);

  }, [attendees]);

  // Calcola i totali complessivi per la nuova tabella
  const monthlyDepartmentRankGrandTotals = useMemo(() => {
      return monthlyDepartmentRankTotals.reduce(
          (acc, curr) => {
              acc.officers += curr.officers;
              acc.inspectors += curr.inspectors;
              acc.superintendents += curr.superintendents;
              acc.militari += curr.militari;
              acc.actualTotal += curr.actualTotal;
              return acc;
          },
          { officers: 0, inspectors: 0, superintendents: 0, militari: 0, actualTotal: 0 }
      );
  }, [monthlyDepartmentRankTotals]);

  // Raggruppa discenti per evento per la visualizzazione dettagliata
  const attendeesByEvent = useMemo(() => {
    const map = new Map<string, DepartmentAttendee[]>();
    attendees.forEach(att => {
      if (!map.has(att.event_id)) {
        map.set(att.event_id, []);
      }
      map.get(att.event_id)?.push(att);
    });
    return map;
  }, [attendees]);

  return {
    events,
    attendees,
    loading,
    totalCoursesMonth,
    totalActualAttendeesMonth,
    statsByType,
    monthlyDepartmentRankTotals,
    monthlyDepartmentRankGrandTotals,
    attendeesByEvent,
    fetchStats,
  };
};