import { Calendar, Clock, FileText, Users, AlertTriangle, CheckCircle2, MapPin, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/hooks/useEvents';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, parseISO, isPast, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Event } from '@/types';

const IndexPage = () => {
  const { events, loading } = useEvents();
  const navigate = useNavigate();

  const activeEvents = events.filter(event => event.status !== 'archiviato');

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Caricamento...</p></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <Button 
          onClick={() => navigate('/nuovo-evento')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Crea Nuovo Evento
        </Button>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
          <AlertTriangle className="mr-3 h-7 w-7 text-red-500" /> Scadenze Urgenti
        </h2>
        {activeEvents.length > 0 ? (
          <div className="space-y-6">
            {activeEvents.map(event => {
              const deadlines = [
                { 
                  type: 'richiesta_docenti', 
                  date: new Date(event.start_date), 
                  message: 'Richiesta docenti', 
                  daysBefore: 30 
                },
                { 
                  type: 'richiesta_discenti', 
                  date: new Date(event.start_date), 
                  message: 'Richiesta discenti', 
                  daysBefore: 20 
                },
                { 
                  type: 'avvio_corso', 
                  date: new Date(event.start_date), 
                  message: 'Avvio corso', 
                  daysBefore: 10 
                }
              ].map(d => ({
                ...d,
                date: new Date(d.date.getTime() - d.daysBefore * 24 * 60 * 60 * 1000)
              }));

              return (
                <Card key={event.id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-800">{event.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(event.start_date), "PPP", { locale: it })} - {format(parseISO(event.end_date), "PPP", { locale: it })}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {deadlines.map(deadline => {
                        const daysRemaining = differenceInDays(deadline.date, new Date());
                        const isUrgent = daysRemaining <= 7;
                        const isPastDue = isPast(deadline.date) && !isToday(deadline.date);
                        
                        return (
                          <div 
                            key={`${event.id}-${deadline.type}`} 
                            className={`border-l-4 ${isUrgent ? 'border-red-500' : isPastDue ? 'border-red-700' : 'border-yellow-500'} pl-4 py-3`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{deadline.message}</h3>
                                <p className={`text-sm ${isUrgent ? 'text-red-600' : isPastDue ? 'text-red-700' : 'text-yellow-700'}`}>
                                  Scadenza: {format(deadline.date, "PPP", { locale: it })}
                                  {isPastDue ? ' (SCADUTO)' : isUrgent ? ' (URGENTE)' : ''}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                variant={isPastDue ? "destructive" : isUrgent ? "default" : "outline"}
                                onClick={() => console.log('Marked as completed')}
                                className="ml-4"
                              >
                                {isPastDue ? 'Completato' : 'Completa'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate(`/evento/${event.id}`)}
                    >
                      <Info className="mr-2 h-4 w-4" /> Vai ai dettagli
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">Nessun evento attivo con scadenze imminenti.</p>
        )}
      </section>
    </div>
  );
};

export default IndexPage;