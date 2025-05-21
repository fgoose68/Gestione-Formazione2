import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, PlusCircle, CalendarDays, Archive, BarChart2, Info, LogOut } from 'lucide-react'; // Importa l'icona LogOut
import { useEvents, useDeadlines } from '@/hooks'; // Importa gli hook
import { format, parseISO, isPast, isToday } from 'date-fns'; // Importa funzioni per date
import { it } from 'date-fns/locale'; // Importa locale italiano
import { supabase } from '@/integrations/supabase/client'; // Importa il client Supabase

const IndexPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, loading: eventsLoading } = useEvents(); // Usa l'hook useEvents
  const { deadlines } = useDeadlines(events); // Usa l'hook useDeadlines

  // Filtra gli eventi non archiviati per la dashboard
  const activeEvents = useMemo(() => {
    return events.filter(event => event.status !== 'archiviato');
  }, [events]);

  // Filtra le scadenze imminenti (oggi o future)
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    return deadlines
      .filter(d => !d.completed && (isToday(d.date) || d.date > today))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [deadlines]);

  // Funzione per gestire il logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Errore durante il logout:", error);
      // Potresti mostrare un toast di errore qui se necessario
    } else {
      // La navigazione alla pagina di login è gestita dal ProtectedRoute in App.tsx
      console.log("Logout effettuato con successo.");
    }
  };


  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-800 flex items-center">
          <Clock className="mr-3 h-8 w-8" />
          Dashboard
        </h1>
        <div className="flex space-x-3">
          <Button onClick={() => navigate('/nuovo-evento')} className="bg-green-600 hover:bg-green-700 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> Nuovo Evento
          </Button>
          <Button onClick={() => navigate('/calendario')} variant="outline">
            <CalendarDays className="mr-2 h-5 w-5" /> Calendario
          </Button>
          <Button onClick={() => navigate('/archivio')} variant="outline">
            <Archive className="mr-2 h-5 w-5" /> Archivio
          </Button>
           <Button onClick={() => navigate('/statistica')} variant="outline">
            <BarChart2 className="mr-2 h-5 w-5" /> Statistiche
          </Button>
          {/* Pulsante Log Out */}
          <Button onClick={handleLogout} variant="destructive"> {/* Usiamo la variante 'destructive' per il logout */}
             <LogOut className="mr-2 h-5 w-5" /> Log Out
          </Button>
        </div>
      </div>

      {/* Sezione Scadenze Imminenti */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
            <Info className="mr-3 h-7 w-7" /> Scadenze Imminenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <p className="text-center text-gray-600">Caricamento scadenze...</p>
          ) : upcomingDeadlines.length > 0 ? (
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className={`border rounded-lg p-4 ${isToday(deadline.date) ? 'bg-yellow-100 border-yellow-400' : 'bg-slate-50 border-gray-200'} hover:bg-slate-100 transition-colors cursor-pointer`}
                     onClick={() => navigate(`/evento/${deadline.eventId}`)}>
                  <p className="font-medium text-gray-800">{deadline.message}</p>
                  <p className={`text-sm ${isToday(deadline.date) ? 'text-yellow-700 font-semibold' : 'text-gray-500'}`}>
                    Scadenza: {format(deadline.date, "PPP", { locale: it })} ({format(deadline.date, "EEEE", { locale: it })})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">Nessuna scadenza imminente.</p>
          )}
        </CardContent>
      </Card>


      {/* Sezione Eventi Attivi */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
             <CalendarDays className="mr-3 h-7 w-7" /> Eventi Attivi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <p className="text-center text-gray-600">Caricamento eventi...</p>
          ) : activeEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Luogo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{format(parseISO(event.start_date), "PPP", { locale: it })} - {format(parseISO(event.end_date), "PPP", { locale: it })}</TableCell>
                      <TableCell>{event.location || 'N/D'}</TableCell>
                      <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${ event.status === 'in_preparazione' ? 'bg-yellow-200 text-yellow-800' : event.status === 'completato' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                           {event.status.replace('_', ' ')}
                         </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/evento/${event.id}`)}>
                          Dettagli
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-gray-600">Nessun evento attivo trovato. <Button variant="link" onClick={() => navigate('/nuovo-evento')} className="p-0 h-auto">Crea un nuovo evento</Button>.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IndexPage;