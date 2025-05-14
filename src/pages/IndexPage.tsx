import { Calendar, Clock, FileText, Users, Archive, PlusCircle, AlertTriangle, CheckCircle2, MapPin, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useEvents, useDeadlines } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, parseISO, isPast, isToday, isWithinInterval, addDays } from 'date-fns'; // Importa isWithinInterval e addDays
import { it } from 'date-fns/locale';
import { Event } from '@/types';
import { showSuccess } from '@/utils/toast'; // Importa showSuccess

const IndexPage = () => {
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
    console.log(`Simulazione aggiornamento task ${taskType} per evento ${eventId}`);
    // Qui dovresti implementare la logica per aggiornare event.completed_tasks
    // e persistere questo cambiamento nel database tramite una funzione in useEvents.
    // Esempio: await updateEventCompletedTasks(eventId, [...(event.completed_tasks || []), taskType]);
    // Per ora, mostriamo solo un messaggio di successo simulato
    showSuccess(`Task "${taskType.replace('_', ' ')}" segnato come completato per "${event.title}" (simulato)`);
  };

  if (eventsLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Caricamento dashboard...</p></div>;
  }

  const activeEvents = events.filter(event => event.status !== 'archiviato');

  // Filtra le scadenze per mostrare solo quelle non completate e future/odierne
  const upcomingDeadlines = deadlines.filter(d => !d.completed && (isToday(d.date) || d.date > new Date()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100">
      <nav className="bg-blue-800 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="bg-white text-blue-800 px-2 py-1 rounded mr-2 shadow">GESTIO</span>
            <span className="tracking-wider">FORMAZIONE</span>
          </h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => navigate('/')}>
              <Clock className="mr-2 h-5 w-5" /> Dashboard
            </Button>
            <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => navigate('/calendario')}>
              <Calendar className="mr-2 h-5 w-5" /> Calendario
            </Button>
            <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => navigate('/archivio')}>
              <Archive className="mr-2 h-5 w-5" /> Archivio
            </Button>
             <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => navigate('/statistica')}>
              <BarChart2 className="mr-2 h-5 w-5" /> Statistica
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        <div className="mb-8 text-center"> {/* Centrato il bottone */}
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-transform transform hover:scale-105" onClick={() => navigate('/nuovo-evento')}> {/* Aggiunto effetto hover */}
            <PlusCircle className="mr-2 h-6 w-6" /> Crea Nuovo Evento
          </Button>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
            <AlertTriangle className="mr-3 h-7 w-7 text-red-500" /> Scadenze Urgenti
          </h2>
          {upcomingDeadlines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingDeadlines.slice(0, 6).map(deadline => {
                const today = new Date();
                const daysUntil = differenceInDays(deadline.date, today);
                
                let borderColor = 'border-yellow-500'; // Scadenza lontana
                let textColor = 'text-yellow-700';
                
                if (isPast(deadline.date) && !isToday(deadline.date)) {
                   borderColor = 'border-red-700'; // Scaduta
                   textColor = 'text-red-700';
                } else if (isToday(deadline.date)) {
                   borderColor = 'border-red-500'; // Oggi
                   textColor = 'text-red-600';
                } else if (daysUntil <= 10) {
                   borderColor = 'border-orange-500'; // Entro 10 giorni
                   textColor = 'text-orange-700';
                }

                return (
                  <Card key={`${deadline.eventId}-${deadline.type}`} className={`shadow-lg hover:shadow-xl transition-shadow border-l-4 ${borderColor}`}>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-gray-800">{deadline.message}</CardTitle>
                      <p className="text-xs text-gray-500">Evento: {deadline.eventTitle}</p>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-sm font-medium ${textColor}`}>
                        Scadenza: {format(deadline.date, "PPP", { locale: it })}
                        {isToday(deadline.date) && " (OGGI)"}
                        {isPast(deadline.date) && !isToday(deadline.date) && " (SCADUTO)"}
                        {daysUntil > 0 && daysUntil <= 10 && ` (tra ${daysUntil} giorni)`} {/* Mostra giorni rimanenti solo se > 0 e <= 10 */}
                      </p>
                    </CardContent>
                     <CardFooter>
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsCompleted(deadline.eventId, deadline.type + '_fatta')}>
                        <CheckCircle2 className="mr-2 h-4 w-4"/> Segna come completata (Simulato)
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
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
                       {event.type && <p className="text-sm text-gray-600 mb-1">Tipo: <span className="font-medium">{event.type}</span></p>} {/* Visualizza tipo */}
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
                    <CardFooter className="border-t pt-4 flex justify-between items-center"> {/* Modificato per allineare */}
                      <Button variant="outline" size="sm" onClick={() => navigate(`/evento/${event.id}`)}>Dettagli</Button>
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

export default IndexPage;