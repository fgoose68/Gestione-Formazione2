import { Calendar, Clock, FileText, Users, Download, Archive, PlusCircle, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'; // Added MapPin here
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useEvents, useDeadlines } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, parseISO, isPast, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Event, Deadline } from '@/types'; 

const Index = () => {
  const { events, loading: eventsLoading, updateEventStatus } = useEvents();
  const { deadlines } = useDeadlines(events);
  const navigate = useNavigate();

  const getEventProgress = (event: Event): number => {
    const totalTasks = 5; 
    let completedTasks = 0;
    if (event.completed_tasks?.includes('richiesta_docenti_fatta')) completedTasks++;
    if (event.completed_tasks?.includes('richiesta_discenti_fatta')) completedTasks++;
    if (event.completed_tasks?.includes('avvio_corso_fatto')) completedTasks++;
    if (event.completed_tasks?.includes('registri_gestiti')) completedTasks++;
    if (event.completed_tasks?.includes('feedback_raccolto')) completedTasks++;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };
  
  const getDaysRemaining = (dateString: string): number => {
    return differenceInDays(parseISO(dateString), new Date());
  };

  const handleMarkAsCompleted = async (eventId: string, taskType: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedTasks = [...(event.completed_tasks || []), taskType];
    console.log(`Simulazione aggiornamento task ${taskType} per evento ${eventId}`);
    // Placeholder: In a real app, you'd call a function like:
    // await updateEventTasks(eventId, updatedTasks); 
    // For now, this function doesn't exist in useEvents, so this is a client-side simulation.
    // To make this persistent, you'd need to add `updateEventTasks` to `useEvents`
    // and update the `completed_tasks` field in your Supabase 'events' table.
  };


  if (eventsLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Caricamento dashboard...</p></div>;
  }
  
  const activeEvents = events.filter(event => event.status !== 'archiviato');
  // const archivedEvents = events.filter(event => event.status === 'archiviato'); // Not used yet


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100">
      <nav className="bg-blue-800 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="bg-white text-blue-800 px-2 py-1 rounded mr-2 shadow">GESTIO</span>
            <span className="tracking-wider">FORMAZIONE</span>
          </h1>
          <div className="flex space-x-2">
            <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => navigate('/')}>
              <Clock className="mr-2 h-5 w-5" /> Dashboard
            </Button>
            <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => navigate('/calendario')}>
              <Calendar className="mr-2 h-5 w-5" /> Calendario
            </Button>
            <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => navigate('/archivio')}> 
              <Archive className="mr-2 h-5 w-5" /> Archivio
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        <div className="mb-8">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-md" onClick={() => navigate('/nuovo-evento')}>
            <PlusCircle className="mr-2 h-6 w-6" /> Crea Nuovo Evento
          </Button>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
            <AlertTriangle className="mr-3 h-7 w-7 text-red-500" /> Scadenze Urgenti
          </h2>
          {deadlines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deadlines.slice(0, 6).map(deadline => ( 
                <Card key={`${deadline.eventId}-${deadline.type}`} className={`shadow-lg hover:shadow-xl transition-shadow border-l-4 ${
                  isToday(deadline.date) ? 'border-red-500' : isPast(deadline.date) ? 'border-red-700' : 'border-yellow-500'
                }`}>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-800">{deadline.message}</CardTitle>
                    <p className="text-xs text-gray-500">Evento: {deadline.eventTitle}</p>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm font-medium ${
                      isToday(deadline.date) || isPast(deadline.date) ? 'text-red-600' : 'text-yellow-700'
                    }`}>
                      Scadenza: {format(deadline.date, "PPP", { locale: it })}
                      {isToday(deadline.date) && " (OGGI)"}
                      {isPast(deadline.date) && !isToday(deadline.date) && " (SCADUTO)"}
                    </p>
                  </CardContent>
                   <CardFooter>
                    <Button size="sm" variant="outline" onClick={() => handleMarkAsCompleted(deadline.eventId, deadline.type + '_fatta')}>
                      <CheckCircle2 className="mr-2 h-4 w-4"/> Segna come completata
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nessuna scadenza imminente. Ottimo lavoro!</p>
          )}
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
            <Calendar className="mr-3 h-7 w-7" /> Eventi Attivi
          </h2>
          {activeEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map(event => {
                const daysLeft = getDaysRemaining(event.start_date);
                const progress = getEventProgress(event);
                return (
                  <Card key={event.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-xl text-blue-800">{event.title}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(event.start_date), "PPP", { locale: it })} - {format(parseISO(event.end_date), "PPP", { locale: it })}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-600 mb-1">Stato: <span className="font-medium">{event.status.replace('_', ' ')}</span></p>
                      {daysLeft >= 0 ? (
                        <p className="text-sm text-orange-600 mb-3">{daysLeft} giorni rimanenti</p>
                      ) : (
                        <p className="text-sm text-red-600 mb-3">Evento passato</p>
                      )}
                      <div className="mb-1">
                        <Progress value={progress} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1 text-right">{progress.toFixed(0)}% completato</p>
                      </div>
                      {event.location && <p className="text-xs text-gray-500"><MapPin className="inline h-3 w-3 mr-1"/>{event.location}</p>}
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => navigate(`/evento/${event.id}`)}>Dettagli</Button>
                       {event.status !== 'archiviato' && (
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600" onClick={() => updateEventStatus(event.id, 'archiviato')}>
                          <Archive className="mr-1 h-4 w-4" /> Archivia
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">Nessun evento attivo. Crea un nuovo evento per iniziare!</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;