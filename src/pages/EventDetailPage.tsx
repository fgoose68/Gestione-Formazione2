import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Event, DepartmentAttendee } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Importa i componenti Select
import { CalendarDays, MapPin, Users, Info, ArrowLeftCircle, Edit, Save, Tag, Archive, CheckCircle, XCircle } from 'lucide-react'; // Importa Archive, CheckCircle, XCircle
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { showError, showSuccess } from '@/utils/toast';
import { useEvents } from '@/hooks/useEvents'; // Mantieni useEvents
import { useDepartmentAttendees } from '@/hooks/useDepartmentAttendees';
import { getEventDisplayStatus, isEventEndingSoon } from '@/utils/eventStatus'; // Importa le nuove utility
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Importa AlertDialog

// Definisci le scadenze standard e le loro chiavi per il campo completed_tasks
const STANDARD_DEADLINE_TASKS = [
  { label: 'Richiesta Docenti', key: 'richiesta_docente_fatta' },
  { label: 'Richiesta Discenti', key: 'richiesta_discenti_fatta' },
  { label: 'Avvio Corso', key: 'avvio_corso_fatto' },
  { label: 'Gestione Registri', key: 'gestione_registri_fatta' },
  { label: 'Raccolta Feedback', key: 'raccolta_feedback_fatta' },
  { label: 'Generazione Modello L', key: 'generazione_modello_l_fatta' },
];

const EventDetailPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { events, loading: eventLoading, updateEventStatus, updateEvent } = useEvents(); 
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
        // Considera se navigare via o mostrare messaggio
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

  const handleNavigateToEdit = () => {
    if(eventId) navigate(`/evento/${eventId}/modifica`);
  };

  const handleArchiveEvent = async () => {
    if (eventId) {
      const result = await updateEventStatus(eventId, 'archiviato');
      if (result) {
        showSuccess("Evento archiviato con successo!");
        navigate('/');
      } else {
        showError("Errore durante l'archiviazione dell'evento.");
      }
    }
  };

  // Funzione per gestire il cambio di stato di una scadenza
  const handleDeadlineStatusChange = async (deadlineKey: string, value: 'SI' | 'NO') => {
    if (!event || !eventId) return;

    const currentCompletedTasks = new Set(event.completed_tasks || []);
    let updatedCompletedTasks: string[];

    if (value === 'SI') {
      currentCompletedTasks.add(deadlineKey);
    } else {
      currentCompletedTasks.delete(deadlineKey);
    }
    updatedCompletedTasks = Array.from(currentCompletedTasks);

    const result = await updateEvent(eventId, { completed_tasks: updatedCompletedTasks });
    if (result) {
      showSuccess(`Stato scadenza "${STANDARD_DEADLINE_TASKS.find(d => d.key === deadlineKey)?.label}" aggiornato!`);
      // L'hook useEvents dovrebbe già aggiornare lo stato locale dopo il fetch
    } else {
      showError(`Errore nell'aggiornamento dello stato della scadenza "${STANDARD_DEADLINE_TASKS.find(d => d.key === deadlineKey)?.label}".`);
    }
  };


  if (eventLoading || (attendeesLoading && !initialDataLoaded && eventId)) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-gray-700">Caricamento dettagli evento...</p>
      </div>
    );
  }

  if (!event && !eventLoading && eventId) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-red-600">Evento non trovato.</p>
        <Button onClick={() => navigate('/')} className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black">
          <ArrowLeftCircle className="mr-2 h-5 w-5" />
          Torna alla Dashboard
        </Button>
      </div>
    );
  }
  
  if (!event && !eventId) {
     return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-red-600">ID Evento non specificato.</p>
        <Button onClick={() => navigate('/')} className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black">
          <ArrowLeftCircle className="mr-2 h-5 w-5" />
          Torna alla Dashboard
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate('/')} className="bg-yellow-400 hover:bg-yellow-500 text-black">
          <ArrowLeftCircle className="mr-2 h-5 w-5" />
          Torna alla Dashboard
        </Button>
        {event && event.status !== 'archiviato' && (
          <div className="flex space-x-3">
            <Button onClick={handleNavigateToEdit} variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Edit className="mr-2 h-5 w-5" />
              Modifica Dati Evento
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" className="bg-gray-300 hover:bg-gray-400 text-gray-800">
                  <Archive className="mr-2 h-5 w-5" />
                  Archivia Evento
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro di voler archiviare questo evento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    L'evento verrà spostato nella sezione Archivio e non sarà più visibile nella Dashboard principale. Potrai gestirlo dall'archivio.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchiveEvent} className="bg-gray-600 hover:bg-gray-700">Archivia</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
         {event && event.status === 'archiviato' && (
            <div className="flex items-center text-gray-600 font-medium">
               <Archive className="mr-2 h-5 w-5" /> Evento Archiviato
            </div>
         )}
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
                  <p><span className="font-medium">Inizio:</span> {format(parseISO(event.start_date), "PPP", { locale: it })}</p>
                  <p><span className="font-medium">Fine:</span> {format(parseISO(event.end_date), "PPP", { locale: it })}</p>
                </div>
                {event.location && <div><h3 className="text-lg font-semibold text-blue-700 flex items-center"><MapPin className="mr-2 h-5 w-5 text-orange-500" />Luogo</h3><p>{event.location}</p></div>}
              </div>
              {/* Visualizzazione Tipo Corso */}
              {event.type && (
                 <div>
                   <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center"><Tag className="mr-2 h-5 w-5 text-orange-500" />Tipo Corso</h3>
                   <p className="font-medium">{event.type}</p>
                 </div>
              )}
              {event.teachers?.length > 0 && <div><h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center"><Users className="mr-2 h-5 w-5 text-orange-500" />Docenti</h3><ul className="list-disc list-inside pl-5 bg-slate-100 p-3 rounded-md">{event.teachers.map((t, i) => <li key={i}>{t}</li>)}</ul></div>}
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center"><Info className="mr-2 h-5 w-5 text-orange-500" />Stato</h3>
                <p className={`font-medium capitalize px-3 py-1 inline-block rounded-full ${ 
                  event.displayStatus === 'concluso' ? 'bg-blue-700 text-white' : 
                  event.displayStatus === 'in_programma' ? 'bg-green-600 text-white' : 
                  event.displayStatus === 'in_corso' ? 'bg-red-600 text-white' : 
                  'bg-gray-200 text-gray-800' 
                }`}>
                  {event.displayStatus?.replace('_', ' ') || 'N/D'}
                  {event.displayStatus === 'in_corso' && isEventEndingSoon(event) && ' (in chiusura)'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* NUOVA SEZIONE: Scadenze Previste (solo per corsi Standard) */}
          {event.type !== 'E-learning' && event.type !== 'Didattica a distanza (DAD)' && (
            <Card className="shadow-xl mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
                  <Clock className="mr-3 h-7 w-7" /> Scadenze Previste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {STANDARD_DEADLINE_TASKS.map((deadline) => (
                  <div key={deadline.key} className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
                    <span className="font-medium text-gray-800">{deadline.label}</span>
                    <Select
                      value={event.completed_tasks?.includes(deadline.key) ? 'SI' : 'NO'}
                      onValueChange={(value: 'SI' | 'NO') => handleDeadlineStatusChange(deadline.key, value)}
                      disabled={event.status === 'archiviato'} // Disabilita se l'evento è archiviato
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SI">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> SI
                          </div>
                        </SelectItem>
                        <SelectItem value="NO">
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 mr-2 text-red-600" /> NO
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
                      {attendeesWithCalculatedAbsent.map(att => (
                        <TableRow key={att.department_name}>
                          <TableCell className="font-medium">{att.department_name}</TableCell>
                          {(['officers', 'inspectors', 'superintendents', 'militari'] as const).map(field => (
                            <TableCell key={field} className="text-center">
                              <Input type="number" min="0" value={att[field] || 0} onChange={(e) => handleAttendeeChange(att.department_name, field, e.target.value)} className="w-20 text-center mx-auto" disabled={attendeesLoading || event.status === 'archiviato'}/>
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-medium bg-blue-50">{att.expected || 0}</TableCell>
                          <TableCell className="text-center">
                             <Input type="number" min="0" value={att.actual || 0} onChange={(e) => handleAttendeeChange(att.department_name, 'actual', e.target.value)} className="w-20 text-center mx-auto" disabled={attendeesLoading || event.status === 'archiviato'}/>
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
              <Button onClick={saveAttendees} disabled={attendeesLoading || !initialDataLoaded || event.status === 'archiviato'} className="bg-green-600 hover:bg-green-700 text-white">
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