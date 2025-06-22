import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, BarChart2, CalendarDays, Users, Info, Tag, Download } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Event, DepartmentAttendee } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, getMonth, getYear } from 'date-fns';
import { it } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { DEFAULT_DEPARTMENTS } from '@/constants/departments';
import { getEventDisplayStatus } from '@/utils/eventStatus';
import { exportDepartmentAttendeesToExcel, exportCourseTypeStatsToExcel } from '@/utils/excelExport';
import { Calendar } from '@/components/ui/calendar'; // Importa Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Importa Popover
import { DateRange } from 'react-day-picker'; // Importa DateRange
import { COURSE_TYPES } from '@/constants/courseTypes'; // Importa la costante

const StatisticaPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<DepartmentAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Stato per il mese visualizzato

  // Nuovi stati per il filtro del report
  const [reportDateRange, setReportDateRange] = useState<DateRange | undefined>(undefined);
  const [reportEvents, setReportEvents] = useState<Event[]>([]);
  const [reportAttendees, setReportAttendees] = useState<DepartmentAttendee[]>([]);
  const [reportLoading, setReportLoading] = useState(false);


  const startOfCurrentMonth = startOfMonth(currentMonth);
  const endOfCurrentMonth = endOfMonth(currentMonth);

  const fetchStatsData = async () => {
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
        description: `Errore caricamento statistiche: ${err.message}`,
        variant: "destructive",
      });
      console.error("Errore fetchStatsData:", err);
      setEvents([]);
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  // Nuova funzione per il fetch dei dati del report basato sul range di date
  const fetchReportData = async () => {
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
  };


  useEffect(() => {
    fetchStatsData();
  }, [currentMonth]);

  useEffect(() => {
    fetchReportData();
  }, [reportDateRange]); // Riesegui il fetch quando cambia il range di date del report


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

  // Funzione per gestire il download dell'Excel del Riepilogo Discenti
  const handleDownloadDepartmentAttendeesExcel = () => {
    const monthYearString = format(currentMonth, "MMMM yyyy", { locale: it });
    exportDepartmentAttendeesToExcel(monthlyDepartmentRankTotals, monthlyDepartmentRankGrandTotals, monthYearString);
  };

  // Funzione per gestire il download dell'Excel delle Statistiche per Tipo di Corso (per il report)
  const handleDownloadCourseTypeStatsExcel = () => {
    if (!reportDateRange?.from || !reportDateRange?.to) {
      toast({
        title: "Attenzione",
        description: "Seleziona un intervallo di date valido per il report.",
        variant: "warning",
      });
      return;
    }
    const dateRangeString = `${format(reportDateRange.from, "dd-MM-yyyy")} al ${format(reportDateRange.to, "dd-MM-yyyy")}`;
    exportCourseTypeStatsToExcel(reportStatsByType, [...COURSE_TYPES, 'Non Specificato'], dateRangeString);
  };


  // Funzioni per cambiare mese
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };


  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Caricamento statistiche...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-blue-800 flex items-center">
          <BarChart2 className="mr-3 h-8 w-8" />
          Statistiche Eventi
        </h1>
        <div className="flex flex-col space-y-3">
          <Button onClick={() => navigate('/')} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            <Home className="mr-2 h-4 w-4" />
            Torna alla Dashboard
          </Button>
          <Button onClick={handleDownloadDepartmentAttendeesExcel} className="bg-green-600 hover:bg-green-700 text-white">
            <Download className="mr-2 h-4 w-4" />
            Riepilogo Discenti Mensile
          </Button>
        </div>
      </div>

      {/* Navigazione Mese */}
      <div className="flex items-center justify-center mb-8 space-x-4">
         <Button variant="outline" onClick={goToPreviousMonth}>Mese Precedente</Button>
         <h2 className="text-2xl font-semibold text-blue-700">
           {format(currentMonth, "MMMM yyyy", { locale: it })}
         </h2>
         <Button variant="outline" onClick={goToNextMonth}>Mese Successivo</Button>
      </div>

      {/* Statistiche Aggregate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="text-xl font-semibold text-blue-700 flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-orange-500" /> Totale Corsi nel Mese</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold text-center text-blue-900">{totalCoursesMonth}</p></CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="text-xl font-semibold text-blue-700 flex items-center"><Users className="mr-2 h-6 w-6 text-orange-500" /> Totale Discenti Effettivi</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold text-center text-blue-900">{totalActualAttendeesMonth}</p></CardContent>
        </Card>
      </div>

      {/* Statistiche per Tipo di Corso (Mese Corrente) */}
      <Card className="shadow-lg mb-8">
         <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Tag className="mr-3 h-7 w-7" /> Statistiche per Tipo di Corso (Mese Corrente)</CardTitle></CardHeader>
         <CardContent>
           {Object.keys(statsByType).length > 0 ? (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="font-semibold">Tipo Corso</TableHead>
                   <TableHead className="text-center font-semibold">Numero Corsi</TableHead>
                   <TableHead className="text-center font-semibold">Totale Discenti Effettivi</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {[...COURSE_TYPES, 'Non Specificato'].map(type => (
                   <TableRow key={type}>
                     <TableCell className="font-medium">{type}</TableCell>
                     <TableCell className="text-center">{statsByType[type]?.count || 0}</TableCell>
                     <TableCell className="text-center">{statsByType[type]?.totalActual || 0}</TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           ) : (
             <p className="text-gray-600">Nessun dato disponibile per le statistiche per tipo nel mese corrente.</p>
           )}
         </CardContent>
      </Card>

      {/* NUOVA SEZIONE: Report per Periodo Selezionato */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
            <Download className="mr-3 h-7 w-7" /> Genera Report per Periodo
          </CardTitle>
          <CardDescription>Seleziona un intervallo di date per generare un report Excel dei corsi per tipo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleziona Intervallo Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${!reportDateRange && "text-muted-foreground"}`}
                  disabled={reportLoading}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {reportDateRange?.from ? (
                    reportDateRange.to ? (
                      <>
                        {format(reportDateRange.from, "PPP", { locale: it })} -{" "}
                        {format(reportDateRange.to, "PPP", { locale: it })}
                      </>
                    ) : (
                      format(reportDateRange.from, "PPP", { locale: it })
                    )
                  ) : (
                    <span>Seleziona le date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={reportDateRange?.from}
                  selected={reportDateRange}
                  onSelect={setReportDateRange}
                  numberOfMonths={2}
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>
          {reportDateRange?.from && reportDateRange?.to && (
            <div className="text-center text-lg font-medium text-gray-700">
              {reportLoading ? (
                <p>Caricamento corsi...</p>
              ) : (
                <p>Trovati <span className="text-blue-600 font-bold">{reportEvents.length}</span> corsi nel periodo selezionato.</p>
              )}
            </div>
          )}
          <Button
            onClick={handleDownloadCourseTypeStatsExcel}
            disabled={reportLoading || !reportDateRange?.from || !reportDateRange?.to || reportEvents.length === 0}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Scarica Report Corsi per Tipo
          </Button>
        </CardContent>
      </Card>


      {/* Riepilogo Mensile Discenti per Reparto e Grado */}
      <Card className="shadow-lg mb-8">
         <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Users className="mr-3 h-7 w-7" /> Riepilogo Mensile Discenti per Reparto e Grado</CardTitle></CardHeader>
         <CardContent>
           {loading ? (
             <p className="text-center text-gray-600">Caricamento dati discenti...</p>
           ) : monthlyDepartmentRankTotals.length > 0 ? (
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="font-semibold">Reparto</TableHead>
                     <TableHead className="text-center font-semibold">Uff. (Previsti)</TableHead>
                     <TableHead className="text-center font-semibold">Isp. (Previsti)</TableHead>
                     <TableHead className="text-center font-semibold">Sovr. (Previsti)</TableHead>
                     <TableHead className="text-center font-semibold">Mil./App. (Previsti)</TableHead>
                     <TableHead className="text-center font-semibold bg-blue-50">Totale Previsti</TableHead>
                     <TableHead className="text-center font-semibold bg-green-50">Totale Effettivi</TableHead>
                     <TableHead className="text-center font-semibold bg-red-50">Assenti</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {monthlyDepartmentRankTotals.map(att => {
                      const totalExpectedForDept = att.officers + att.inspectors + att.superintendents + att.militari;
                      const absentForDept = Math.max(0, totalExpectedForDept - att.actualTotal);

                      return (
                         <TableRow key={att.department_name}>
                            <TableCell className="font-medium">{att.department_name}</TableCell>
                            <TableCell className="text-center">{att.officers}</TableCell>
                            <TableCell className="text-center">{att.inspectors}</TableCell>
                            <TableCell className="text-center">{att.superintendents}</TableCell>
                            <TableCell className="text-center">{att.militari}</TableCell>
                            <TableCell className="text-center font-medium bg-blue-50">{totalExpectedForDept}</TableCell>
                            <TableCell className="text-center font-medium bg-green-50">{att.actualTotal}</TableCell>
                            <TableCell className="text-center font-medium bg-red-50">{absentForDept}</TableCell>
                         </TableRow>
                      );
                   })}
                 </TableBody>
                 <TableFooter>
                   <TableRow className="bg-slate-100">
                     <TableHead className="font-bold text-slate-800">TOTALE Mese</TableHead>
                     <TableCell className="text-center font-bold text-slate-800">{monthlyDepartmentRankGrandTotals.officers}</TableCell>
                     <TableCell className="text-center font-bold text-slate-800">{monthlyDepartmentRankGrandTotals.inspectors}</TableCell>
                     <TableCell className="text-center font-bold text-slate-800">{monthlyDepartmentRankGrandTotals.superintendents}</TableCell>
                     <TableCell className="text-center font-bold text-slate-800">{monthlyDepartmentRankGrandTotals.militari}</TableCell>
                     <TableCell className="text-center font-bold text-slate-800 bg-blue-100">{monthlyDepartmentRankGrandTotals.officers + monthlyDepartmentRankGrandTotals.inspectors + monthlyDepartmentRankGrandTotals.superintendents + monthlyDepartmentRankGrandTotals.militari}</TableCell>
                     <TableCell className="text-center font-bold text-slate-800 bg-green-100">{monthlyDepartmentRankGrandTotals.actualTotal}</TableCell>
                     <TableCell className="text-center font-bold text-slate-800 bg-red-100">
                        {Math.max(0, (monthlyDepartmentRankGrandTotals.officers + monthlyDepartmentRankGrandTotals.inspectors + monthlyDepartmentRankGrandTotals.superintendents + monthlyDepartmentRankGrandTotals.militari) - monthlyDepartmentRankGrandTotals.actualTotal)}
                     </TableCell>
                   </TableRow>
                 </TableFooter>
               </Table>
             </div>
           ) : (
             <p className="text-center text-gray-600">Nessun dato discenti disponibile per questo mese.</p>
           )}
         </CardContent>
      </Card>


      {/* Dettaglio Discenti per Corso (esistente) */}
      <Card className="shadow-lg">
        <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Info className="mr-2 h-7 w-7" /> Dettaglio Discenti per Corso (Mese Corrente)</CardTitle></CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-8">
              {events.map(event => {
                 const eventAttendeesWithAbsent = (attendeesByEvent.get(event.id) || []).map(att => ({
                    ...att,
                    absent: Math.max(0, (att.expected || 0) - (att.actual || 0)),
                 }));

                 const eventTotals = eventAttendeesWithAbsent.reduce(
                   (acc, curr) => {
                     acc.officers += curr.officers || 0;
                     acc.inspectors += curr.inspectors || 0;
                     acc.superintendents += curr.superintendents || 0;
                     acc.militari += curr.militari || 0;
                     acc.expected += curr.expected || 0;
                     acc.actual += curr.actual || 0;
                     acc.absent += curr.absent || 0;
                     return acc;
                   },
                   { officers: 0, inspectors: 0, superintendents: 0, militari: 0, expected: 0, actual: 0, absent: 0 }
                 );

                return (
                  <div key={event.id} className="border rounded-lg p-4 bg-slate-50">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">{event.title}</h3>
                     {event.type && <p className="text-sm text-gray-600 mb-1">Tipo: <span className="font-medium">{event.type}</span></p>}
                     <p className="text-sm text-gray-600 mb-3">
                       Periodo: {format(parseISO(event.start_date), "PPP", { locale: it })} - {format(parseISO(event.end_date), "PPP", { locale: it })}
                     </p>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold">Reparto</TableHead>
                            <TableHead className="text-center font-semibold">Uff.</TableHead>
                            <TableHead className="text-center font-semibold">Isp.</TableHead>
                            <TableHead className="text-center font-semibold">Sovr.</TableHead>
                            <TableHead className="text-center font-semibold">Mil./App.</TableHead>
                            <TableHead className="text-center font-semibold bg-blue-50">Previsti</TableHead>
                            <TableHead className="text-center font-semibold">Effettivi</TableHead>
                            <TableHead className="text-center font-semibold bg-red-50">Assenti</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {eventAttendeesWithAbsent.map(att => (
                             <TableRow key={att.department_name}>
                                <TableCell className="font-medium">{att.department_name}</TableCell>
                                <TableCell className="text-center">{att.officers || 0}</TableCell>
                                <TableCell className="text-center">{att.inspectors || 0}</TableCell>
                                <TableCell className="text-center">{att.superintendents || 0}</TableCell>
                                <TableCell className="text-center">{att.militari || 0}</TableCell>
                                <TableCell className="text-center font-medium bg-blue-50">{att.expected || 0}</TableCell>
                                <TableCell className="text-center">{att.actual || 0}</TableCell>
                                <TableCell className="text-center font-medium bg-red-50">{att.absent}</TableCell>
                             </TableRow>
                          )) || (
                             <TableRow><TableCell colSpan={8} className="text-center text-gray-500">Nessun dato discenti per questo evento.</TableCell></TableRow>
                          )}
                        </TableBody>
                         <TableFooter>
                           <TableRow className="bg-slate-100">
                             <TableHead className="font-bold text-slate-800">TOTALE Evento</TableHead>
                             <TableCell className="text-center font-bold text-slate-800">{eventTotals.officers}</TableCell>
                             <TableCell className="text-center font-bold text-slate-800">{eventTotals.inspectors}</TableCell>
                             <TableCell className="text-center font-bold text-slate-800">{eventTotals.superintendents}</TableCell>
                             <TableCell className="text-center font-bold text-slate-800">{eventTotals.militari}</TableCell>
                             <TableCell className="text-center font-bold text-slate-800 bg-blue-50">{eventTotals.expected}</TableCell>
                             <TableCell className="text-center font-bold text-slate-800">{eventTotals.actual}</TableCell>
                             <TableCell className="text-center font-bold text-slate-800 bg-red-50">{eventTotals.absent}</TableCell>
                           </TableRow>
                         </TableFooter>
                      </Table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">Nessun evento trovato per questo mese.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticaPage;