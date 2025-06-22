import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event, DepartmentAttendee } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getEventDisplayStatus } from '@/utils/eventStatus';
import { COURSE_TYPES } from '@/constants/courseTypes';
import { DateRange } from 'react-day-picker';
import { DEFAULT_DEPARTMENTS } from '@/constants/departments'; // Importa i reparti di default

interface ReportStats {
  reportEvents: Event[];
  reportAttendees: DepartmentAttendee[];
  reportLoading: boolean;
  reportStatsByType: { [key: string]: { count: number; totalActual: number } };
  reportDepartmentRankTotals: { // Nuovo campo
    department_name: string;
    officers: number;
    inspectors: number;
    superintendents: number;
    militari: number;
    actualTotal: number;
  }[];
  reportDepartmentRankGrandTotals: { // Nuovo campo
    officers: number;
    inspectors: number;
    superintendents: number;
    militari: number;
    actualTotal: number;
  };
  totalReportCourses: number; // Nuovo campo per il conteggio totale dei corsi
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

  // NUOVA AGGREGAZIONE: Totali effettivi per Reparto e Grado nel periodo del report
  const reportDepartmentRankTotals = useMemo(() => {
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

    reportAttendees.forEach(att => {
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

  }, [reportAttendees]);

  // Calcola i totali complessivi per la nuova tabella del report
  const reportDepartmentRankGrandTotals = useMemo(() => {
      return reportDepartmentRankTotals.reduce(
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
  }, [reportDepartmentRankTotals]);

  // Calcola il numero totale di corsi nel periodo del report
  const totalReportCourses = reportEvents.length;

  return {
    reportEvents,
    reportAttendees,
    reportLoading,
    reportStatsByType,
    reportDepartmentRankTotals,
    reportDepartmentRankGrandTotals,
    totalReportCourses, // Esporta il nuovo conteggio
    fetchReportData,
  };
};