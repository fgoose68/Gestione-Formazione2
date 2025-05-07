import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Event, DepartmentAttendee } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { CalendarDays, MapPin, Users, Info, ArrowLeftCircle, Edit, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { showError, showSuccess } from '@/utils/toast';
import { useEvents } from '@/hooks/useEvents';
import { useDepartmentAttendees } from '@/hooks/useDepartmentAttendees';

const EventDetailPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { events, loading: eventLoading } = useEvents(); // Hook per i dati dell'evento principale
  const [event, setEvent] = useState<Event | null>(null);

  const { 
    attendees: departmentAttendees, 
    loading: attendeesLoading, 
    saveAttendees, 
    updateAttendeeField,
    initialDataLoaded
  } = useDepartmentAttendees(eventId);

  useEffect(() => {
    if (eventId && events.length > 0) {
      const currentEvent = events.find(e => e.id === eventId);
      setEvent(currentEvent || null);
      if (!currentEvent) {
        showError("Evento non trovato.");
        // navigate('/'); // Considera se navigare via o mostrare messaggio
      }
    }
  }, [eventId, events, navigate]);

  const handleAttendeeChange = (departmentName: string, field: keyof Omit<DepartmentAttendee, 'id' | 'event_id' | 'department_name' | 'user_id' | 'expected'>, value: string) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      updateAttendeeField(departmentName, field, numericValue);
    } else if (value === "") {
      updateAttendeeField(departmentName, field, 0);
    }
  };

  // 'expected' è ora calcolato e gestito dall'hook useDepartmentAttendees
  // 'absent' è calcolato qui per la visualizzazione
  const attendeesWithCalculatedAbsent = useMemo(() => {
    return departmentAttendees.map(att => ({
      ...att,
      absent: Math.max(0, (att.expected || 0) - (att.actual || 0)),
    }));
  }, [departmentAttendees]);

  const totals = useMemo(() => {
    return attendeesWithCalculatedAbsent.reduce(
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
  }, [attendeesWithCalculatedAbsent]);

  if (eventLoading || (attendeesLoading && !initialDataLoaded && eventId)) {
    return <div className="container mx-auto p-6 text-center"><p className="text-xl text-gray-700">Caricamento dettagli evento...</p></div>;
  }

  if (!event && !eventLoading && eventId) { // Controlla anche eventLoading per evitare flash di "non trovato"
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-red-600">Evento non trovato.</p>
        <Button onClick={() => navigate('/')} className="mt-4"><ArrowLeftCircle className="mr-2 h-5 w-5" />Torna alla Dashboard</Button>
      </div>
    );
  }
  
  if (!event && !eventId) { // Caso in cui non c'è eventId (es. navigazione diretta errata)
     return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-red-600">ID Evento non specificato.</p>
        <Button onClick={() => navigate('/')} className="mt-4"><ArrowLeftCircle className="mr-2 h-5 w-5" />Torna alla Dashboard</Button>
      </div>
    );
  }


  const handleNavigateToEdit = () => {
    if(eventId) navigate(`/evento/${eventId}/modifica`);
  };

  return (
    <div className="container mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate('/')} variant="outline" className="bg-white hover:bg-slate-100">
          <ArrowLeftCircle className="mr-2 h-5 w-5 text-blue-700" />
          Torna alla Dashboard
        </Button>
        {event && <Button onClick={handleNavigateToEdit} variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">
          <Edit className="mr-2 h-5 w-5" />
          Modifica Dati Evento
        </Button>}
      </div>

      {event && (
        <>
          <Card className="shadow-xl mb-8">
            <CardHeader className="bg-blue-700 text-white rounded-t-lg p-6">
              <CardTitle className="text-3xl font-bold flex items-center"><Info className="mr-3 h-8 w-8" />{event.title}</CardTitle>
              {event.description && <CardDescription className="text-blue-100 mt-2 text-base">{event.description}</CardDescription>}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-orange-500" />Periodo</h3>
                  <p><span className="font-medium">Inizio:</span> {format(parseISO(event.start_date), "PPPp", { locale: it })}</p>
                  <p><span className="font-medium">Fine:</span> {format(parseISO(event.end_date), "PPPp", { locale: it })}</p>
                </div>
                {event.location && <div><h3 className="text-lg font-semibold text-blue-700 flex items-center"><MapPin className="mr-2 h-5 w-5 text-orange-500" />Luogo</h3><p>{event.location}</p></div>}
              </div>
              {event.teachers?.length > 0 && <div><h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center"><Users className="mr-2 h-5 w-5 text-orange-500" />Docenti</h3><ul className="list-disc list-inside pl-5 bg-slate-100 p-3 rounded-md">{event.teachers.map((t, i) => <li key={i}>{t}</li>)}</ul></div>}
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center"><Info className="mr-2 h-5 w-5 text-orange-500" />Stato</h3>
                <p className={`font-medium capitalize px-3 py-1 inline-block rounded-full ${ event.status === 'in_preparazione' ? 'bg-yellow-200 text-yellow-800' : event.status === 'completato' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{event.status.replace('_', ' ')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Users className="mr-3 h-7 w-7" />Gestione Discenti per Reparto</CardTitle></CardHeader>
            <CardContent>
              {(attendeesLoading && !initialDataLoaded) && <p>Caricamento dati discenti...</p>}
              {initialDataLoaded && (
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
                      {attendeesWithCalculatedAbsent.map((att) => (
                        <TableRow key={att.department_name}>
                          <TableCell className="font-medium">{att.department_name}</TableCell>
                          {(['officers', 'inspectors', 'superintendents', 'militari'] as const).map(field => (
                            <TableCell key={field} className="text-center">
                              <Input type="number" min="0" value={att[field] || 0} onChange={(e) => handleAttendeeChange(att.department_name, field, e.target.value)} className="w-20 text-center mx-auto" disabled={attendeesLoading}/>
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-medium bg-blue-50">{att.expected || 0}</TableCell>
                          <TableCell className="text-center">
                             <Input type="number" min="0" value={att.actual || 0} onChange={(e) => handleAttendeeChange(att.department_name, 'actual', e.target.value)} className="w-20 text-center mx-auto" disabled={attendeesLoading}/>
                          </TableCell>
                          <TableCell className="text-center font-medium bg-red-50">{att.absent}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-slate-200">
                        <TableHead className="font-bold text-slate-800">TOTALE</TableHead>
                        <TableCell className="text-center font-bold text-slate-800">{totals.officers}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800">{totals.inspectors}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800">{totals.superintendents}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800">{totals.militari}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800 bg-blue-100">{totals.expected}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800">{totals.actual}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800 bg-red-100">{totals.absent}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveAttendees} disabled={attendeesLoading || !initialDataLoaded} className="bg-green-600 hover:bg-green-700 text-white">
                <Save className="mr-2 h-5 w-5" />Salva Modifiche Discenti
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default EventDetailPage;