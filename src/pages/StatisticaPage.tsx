import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, BarChart2, CalendarDays, Users, Info, Tag } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Event, DepartmentAttendee } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, getMonth, getYear } from 'date-fns';
import { it } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { DEFAULT_DEPARTMENTS } from '@/constants/departments'; // Importa la costante

// Tipi di corso disponibili (usati per raggruppare le statistiche) - AGGIORNATO L'ORDINE
const COURSE_TYPES: Event['type'][] = ['Centralizzato', 'Periferico', 'Iniziativa', 'Didattica a distanza (DAD)', 'e-learning'];


const StatisticaPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<DepartmentAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Stato per il mese visualizzato

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

      // Fetch events (includi il campo 'type')
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*, type') // Seleziona anche il campo 'type'
        .eq('user_id', user.id) // Filtra per utente loggato
        .neq('status', 'archiviato') // ESCLUDI eventi archiviati
        .order('start_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Filter events for the current month
      const monthlyEvents = eventsData.filter(event => {
        const startDate = parseISO(event.start_date);
        return isWithinInterval(startDate, { start: startOfCurrentMonth, end: endOfCurrentMonth });
      });

      setEvents(monthlyEvents || []);

      // Fetch attendees for the events in the current month
      if (monthlyEvents.length > 0) {
         const eventIds = monthlyEvents.map(event => event.id);
         const { data: attendeesData, error: attendeesError } = await supabase
           .from('department_attendees')
           .select('*')
           .in('event_id', eventIds)
           .eq('user_id', user.id); // Filtra per utente loggato

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

  useEffect(() => {
    fetchStatsData();
  }, [currentMonth]); // Riesegui il fetch quando cambia il mese

  // Calcola statistiche aggregate per il mese corrente
  const totalCoursesMonth = events.length;
  const totalActualAttendeesMonth = useMemo(() => {
    return attendees.reduce((total, att) => total + (att.actual || 0), 0);
  }, [attendees]);

  // Calcola statistiche per tipo di corso
  const statsByType = useMemo(() => {
    const typeStats: { [key: string]: { count: number; totalActual: number } } = {};

    // Inizializza con tutti i tipi di corso per mostrare anche quelli con 0 eventi
    // Inizializza anche 'Non Specificato'
    [...COURSE_TYPES, 'Non Specificato'].forEach(type => {
       if (type) { // Assicura che type non sia undefined prima di usarlo come chiave
         typeStats[type] = { count: 0, totalActual: 0 };
       }
    });


    events.forEach(event => {
      const type = event.type || 'Non Specificato';
      // Assicurati che la chiave esista prima di incrementare
      if (!typeStats[type]) {
         typeStats[type] = { count: 0, totalActual: 0 };
      }
      typeStats[type].count++;

      // Trova i discenti per questo evento e somma gli effettivi
      const eventAttendees = attendees.filter(att => att.event_id === event.id);
      const eventTotalActual = eventAttendees.reduce((total, att) => total + (att.actual || 0), 0);
      typeStats[type].totalActual += eventTotalActual;
    });

    return typeStats;
  }, [events, attendees]);


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
        actualTotal: number; // Total actual for this department across all events in the month
      };
    } = {};

    // Initialize with all default departments to ensure they appear even if 0 attendees
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

    // Aggregate actual attendees by department and rank
    attendees.forEach(att => {
      const deptName = att.department_name;
      // Ensure the department exists in the map (should be covered by initialization, but good practice)
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

      // Add actual counts for each rank (these are PREVISTI from the DB structure)
      totalsMap[deptName].officers += att.officers || 0;
      totalsMap[deptName].inspectors += att.inspectors || 0;
      totalsMap[deptName].superintendents += att.superintendents || 0;
      totalsMap[deptName].militari += att.militari || 0;
      // Add total actual for the department
      totalsMap[deptName].actualTotal += att.actual || 0;
    });

    // Convert map to array, ORDERED by DEFAULT_DEPARTMENTS
    return DEFAULT_DEPARTMENTS.map(deptName => totalsMap[deptName]);

  }, [attendees]); // Depends on the attendees data for the current month

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800 flex items-center">
          <BarChart2 className="mr-3 h-8 w-8" />
          Statistiche Eventi
        </h1>
        <Button onClick={() => navigate('/')} className="bg-yellow-400 hover:bg-yellow-500 text-black">
          <Home className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
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

      {/* Statistiche per Tipo di Corso */}
      <Card className="shadow-lg mb-8">
         <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Tag className="mr-3 h-7 w-7" /> Statistiche per Tipo di Corso</CardTitle></CardHeader>
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
                 {/* Ordina le chiavi per visualizzare i tipi nell'ordine desiderato */}
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
             <p className="text-gray-600">Nessun dato disponibile per le statistiche per tipo.</p>
           )}
         </CardContent>
      </Card>

      {/* NUOVA TABELLA: Riepilogo Mensile Discenti per Reparto e Grado */}
      <Card className="shadow-lg mb-8">
         <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Users className="mr-3 h-7 w-7" /> Riepilogo Mensile Discenti per Reparto e Grado</CardTitle></CardHeader> {/* Modificato titolo */}
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
                     <TableHead className="text-center font-semibold bg-red-50">Assenti</TableHead> {/* Aggiunta colonna Assenti */}
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {monthlyDepartmentRankTotals.map(att => {
                      // Calcola gli assenti per questo reparto nel mese
                      const totalExpectedForDept = att.officers + att.inspectors + att.superintendents + att.militari;
                      const absentForDept = Math.max(0, totalExpectedForDept - att.actualTotal);

                      return (
                         <TableRow key={att.department_name}>
                            <TableCell className="font-medium">{att.department_name}</TableCell>
                            <TableCell className="text-center">{att.officers}</TableCell>
                            <TableCell className="text-center">{att.inspectors}</TableCell>
                            <TableCell className="text-center">{att.superintendents}</TableCell>
                            <TableCell className="text-center">{att.militari}</TableCell>
                            <TableCell className="text-center font-medium bg-blue-50">{totalExpectedForDept}</TableCell> {/* Calcola Totale Previsti */}
                            <TableCell className="text-center font-medium bg-green-50">{att.actualTotal}</TableCell>
                            <TableCell className="text-center font-medium bg-red-50">{absentForDept}</TableCell> {/* Cella per Assenti */}
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
                     <TableCell className="text-center font-bold text-slate-800 bg-blue-100">{monthlyDepartmentRankGrandTotals.officers + monthlyDepartmentRankGrandTotals.inspectors + monthlyDepartmentRankGrandTotals.superintendents + monthlyDepartmentRankGrandTotals.militari}</TableCell> {/* Totale Previsti Complessivo */}
                     <TableCell className="text-center font-bold text-slate-800 bg-green-100">{monthlyDepartmentRankGrandTotals.actualTotal}</TableCell>
                     {/* Calcola Totale Assenti Complessivo */}
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
        <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Info className="mr-2 h-7 w-7" /> Dettaglio Discenti per Corso</CardTitle></CardHeader>
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