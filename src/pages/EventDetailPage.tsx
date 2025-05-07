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
import { useEvents } from '@/hooks/useEvents'; // Per caricare i dati dell'evento
import { useDepartmentAttendees } from '@/hooks/useDepartmentAttendees';

const EventDetailPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Hook per i dati dell'evento principale
  const { events, loading: eventLoading } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);

  // Hook per i dati dei discenti per reparto
  const { 
    attendees: departmentAttendees, 
    loading: attendeesLoading, 
    saveAttendees, 
    updateAttendeeField,
    setAttendees: setDepartmentAttendees, // Per poter resettare o modificare direttamente
    initialDataLoaded
  } = useDepartmentAttendees(eventId);

  useEffect(() => {
    if (eventId && events.length > 0) {
      const currentEvent = events.find(e => e.id === eventId);
      if (currentEvent) {
        setEvent(currentEvent);
      } else {
        showError("Evento non trovato nella lista caricata.");
        // navigate('/'); // Potrebbe essere troppo aggressivo se gli eventi non sono ancora caricati
      }
    }
  }, [eventId, events, navigate]);


  const handleAttendeeChange = (departmentName: string, field: keyof DepartmentAttendee, value: string) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      updateAttendeeField(departmentName, field, numericValue);
    } else if (value === "") { // Permetti di cancellare l'input
      updateAttendeeField(departmentName, field, 0);
    }
  };

  const calculatedAttendees = useMemo(() => {
    return departmentAttendees.map(att => ({
      ...att,
      absent: Math.max(0, (att.expected || 0) - (att.actual || 0)),
    }));
  }, [departmentAttendees]);

  const totals = useMemo(() => {
    return calculatedAttendees.reduce(
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
  }, [calculatedAttendees]);

  if (eventLoading || (attendeesLoading && !initialDataLoaded)) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-gray-700">Caricamento dettagli evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-red-600">Evento non trovato o errore nel caricamento.</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          <ArrowLeftCircle className="mr-2 h-5 w-5" />
          Torna alla Dashboard
        </Button>
      </div>
    );
  }
  
  const handleNavigateToEdit = () => {
    navigate(`/evento/${eventId}/modifica`); // Rotta da creare
  };

  return (
    <div className="container mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate('/')} variant="outline" className="bg-white hover:bg-slate-100">
          <ArrowLeftCircle className="mr-2 h-5 w-5 text-blue-700" />
          Torna alla Dashboard
        </Button>
        <Button onClick={handleNavigateToEdit} variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">
          <Edit className="mr-2 h-5 w-5" />
          Modifica Dati Evento
        </Button>
      </div>

      <Card className="shadow-xl mb-8">
        <CardHeader className="bg-blue-700 text-white rounded-t-lg p-6">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Info className="mr-3 h-8 w-8" />
            {event.title}
          </CardTitle>
          {event.description && (
            <CardDescription className="text-blue-100 mt-2 text-base">
              {event.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* ... (contenuto esistente per dettagli evento: date, luogo, docenti, stato) ... */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-orange-500" />
                Periodo di Svolgimento
              </h3>
              <p className="text-gray-700">
                <span className="font-medium">Inizio:</span> {format(parseISO(event.start_date), "EEEE d MMMM yyyy, HH:mm", { locale: it })}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Fine:</span> {format(parseISO(event.end_date), "EEEE d MMMM yyyy, HH:mm", { locale: it })}
              </p>
            </div>
            
            {event.location && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-orange-500" />
                  Luogo
                </h3>
                <p className="text-gray-700">{event.location}</p>
              </div>
            )}
          </div>

          {event.teachers && event.teachers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
                <Users className="mr-2 h-5 w-5 text-orange-500" />
                Docenti Previsti
              </h3>
              <ul className="list-disc list-inside pl-5 text-gray-700 bg-slate-100 p-3 rounded-md">
                {event.teachers.map((teacher, index) => (
                  <li key={index}>{teacher}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* La lista generale di studenti potrebbe essere rimossa o adattata se la tabella per reparto è sufficiente */}
          {/* {event.students && event.students.length > 0 && ( ... )} */}

          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
              <Info className="mr-2 h-5 w-5 text-orange-500" />
              Stato Attuale
            </h3>
            <p className={`text-gray-700 font-medium capitalize px-3 py-1 inline-block rounded-full ${
              event.status === 'in_preparazione' ? 'bg-yellow-200 text-yellow-800' :
              event.status === 'completato' ? 'bg-green-200 text-green-800' :
              event.status === 'archiviato' ? 'bg-gray-200 text-gray-800' : ''
            }`}>
              {event.status.replace('_', ' ')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
            <Users className="mr-3 h-7 w-7" />
            Gestione Discenti per Reparto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendeesLoading && !initialDataLoaded && <p>Caricamento dati discenti...</p>}
          {initialDataLoaded && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Reparto</TableHead>
                    <TableHead className="text-center font-semibold">Uff.</TableHead>
                    <TableHead className="text-center font-semibold">Isp.</TableHead>
                    <TableHead className="text-center font-semibold">Sovr.</TableHead>
                    <TableHead className="text-center font-semibold">Militari/App.</TableHead>
                    <TableHead className="text-center font-semibold">Previsti</TableHead>
                    <TableHead className="text-center font-semibold">Effettivi</TableHead>
                    <TableHead className="text-center font-semibold bg-slate-100">Assenti</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculatedAttendees.map((att) => (
                    <TableRow key={att.department_name}>
                      <TableCell className="font-medium">{att.department_name}</TableCell>
                      {(['officers', 'inspectors', 'superintendents', 'militari', 'expected', 'actual'] as const).map(field => (
                        <TableCell key={field} className="text-center">
                          <Input
                            type="number"
                            min="0"
                            value={att[field] || 0}
                            onChange={(e) => handleAttendeeChange(att.department_name, field, e.target.value)}
                            className="w-20 text-center mx-auto"
                            disabled={attendeesLoading}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-medium bg-slate-100">{att.absent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-blue-100">
                    <TableHead className="font-bold text-blue-800">TOTALE</TableHead>
                    <TableCell className="text-center font-bold text-blue-800">{totals.officers}</TableCell>
                    <TableCell className="text-center font-bold text-blue-800">{totals.inspectors}</TableCell>
                    <TableCell className="text-center font-bold text-blue-800">{totals.superintendents}</TableCell>
                    <TableCell className="text-center font-bold text-blue-800">{totals.militari}</TableCell>
                    <TableCell className="text-center font-bold text-blue-800">{totals.expected}</TableCell>
                    <TableCell className="text-center font-bold text-blue-800">{totals.actual}</TableCell>
                    <TableCell className="text-center font-bold text-blue-800 bg-blue-200">{totals.absent}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={saveAttendees} disabled={attendeesLoading || !initialDataLoaded} className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="mr-2 h-5 w-5" />
            Salva Modifiche Discenti
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EventDetailPage;