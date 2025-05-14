import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, BarChart2, CalendarDays, Users, Info } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Event, DepartmentAttendee } from '@/types';
import { showError } from '@/utils/toast';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, getMonth, getYear } from 'date-fns';
import { it } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

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
      // Rimosso il controllo sull'utente. Le query potrebbero fallire se RLS lo richiede.

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        // Rimosso .eq('user_id', user.id)
        .select('*')
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
           // Rimosso .eq('user_id', user.id)
           ;

         if (attendeesError) throw attendeesError;
         setAttendees(attendeesData || []);
      } else {
         setAttendees([]);
      }


    } catch (err: any) {
      // L'errore specifico "Utente non autenticato" non viene più mostrato qui
      showError(`Errore caricamento statistiche: ${err.message}`);
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

  // Calcola statistiche aggregate
  const totalCoursesMonth = events.length;
  const totalActualAttendeesMonth = useMemo(() => {
    return attendees.reduce((total, att) => total + (att.actual || 0), 0);
  }, [attendees]);

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
        <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-blue-50">
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


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="text-xl font-semibold text-blue-700 flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-orange-500" /> Totale Corsi nel Mese</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold text-center text-blue-900">{totalCoursesMonth}</p></CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="text-xl font-semibold text-blue-700 flex items-center"><Users className="mr-2 h-6 w-6 text-orange-500" /> Totale Discenti Effettivi</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold text-center text-blue-900">{totalActualAttendeesMonth}</p></CardContent>
        </Card>
         {/* TODO: Aggiungere statistiche per tipo di corso se il tipo viene aggiunto al modello Event */}
      </div>

      <Card className="shadow-lg">
        <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Info className="mr-2 h-7 w-7" /> Dettaglio Discenti per Corso</CardTitle></CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-8">
              {events.map(event => (
                <div key={event.id} className="border rounded-lg p-4 bg-slate-50">
                  <h3 className="text-lg font-bold text-blue-800 mb-3">{event.title}</h3>
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
                        {attendeesByEvent.get(event.id)?.map(att => (
                           <TableRow key={att.department_name}>
                              <TableCell className="font-medium">{att.department_name}</TableCell>
                              <TableCell className="text-center">{att.officers || 0}</TableCell>
                              <TableCell className="text-center">{att.inspectors || 0}</TableCell>
                              <TableCell className="text-center">{att.superintendents || 0}</TableCell>
                              <TableCell className="text-center">{att.militari || 0}</TableCell>
                              <TableCell className="text-center font-medium bg-blue-50">{att.expected || 0}</TableCell>
                              <TableCell className="text-center">{att.actual || 0}</TableCell>
                              <TableCell className="text-center font-medium bg-red-50">{Math.max(0, (att.expected || 0) - (att.actual || 0))}</TableCell>
                           </TableRow>
                        )) || (
                           <TableRow><TableCell colSpan={8} className="text-center text-gray-500">Nessun dato discenti per questo evento.</TableCell></TableRow>
                        )}
                      </TableBody>
                       <TableFooter>
                         {/* Calcola totali per singolo evento */}
                         {(() => {
                           const eventAttendees = attendeesByEvent.get(event.id) || [];
                           const eventTotals = eventAttendees.reduce(
                             (acc, curr) => {
                               acc.officers += curr.officers || 0;
                               acc.inspectors += curr.inspectors || 0;
                               acc.superintendents += curr.superintendents || 0;
                               acc.militari += curr.militari || 0;
                               acc.expected += curr.expected || 0;
                               acc.actual += curr.actual || 0;
                               return acc;
                             },
                             { officers: 0, inspectors: 0, superintendents: 0, militari: 0, expected: 0, actual: 0 }
                           );
                           const eventAbsent = Math.max(0, eventTotals.expected - eventTotals.actual);
                           return (
                             <TableRow className="bg-slate-100">
                               <TableHead className="font-bold text-slate-800">TOTALE Evento</TableHead>
                               <TableCell className="text-center font-bold text-slate-800">{eventTotals.officers}</TableCell>
                               <TableCell className="text-center font-bold text-slate-800">{eventTotals.inspectors}</TableCell>
                               <TableCell className="text-center font-bold text-slate-800">{eventTotals.superintendents}</TableCell>
                               <TableCell className="text-center font-bold text-slate-800">{eventTotals.militari}</TableCell>
                               <TableCell className="text-center font-bold text-slate-800 bg-blue-50">{eventTotals.expected}</TableCell>
                               <TableCell className="text-center font-bold text-slate-800">{eventTotals.actual}</TableCell>
                               <TableCell className="text-center font-bold text-slate-800 bg-red-50">{eventAbsent}</TableCell>
                             </TableRow>
                           );
                         })()}
                       </TableFooter>
                    </Table>
                  </div>
                </div>
              ))}
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