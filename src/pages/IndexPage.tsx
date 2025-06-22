import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, PlusCircle, CalendarDays, Archive, BarChart2, Info, LogOut } from 'lucide-react';
import { useEvents } from '@/hooks'; // Rimosso useDeadlines
import { format, parseISO, isPast, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { isEventEndingSoon } from '@/utils/eventStatus'; // Importa la nuova utility

const IndexPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, loading: eventsLoading } = useEvents();

  // Filtra gli eventi non archiviati per la dashboard
  const activeEvents = useMemo(() => {
    return events.filter(event => event.displayStatus !== 'archiviato');
  }, [events]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Errore durante il logout:", error);
      // Potresti mostrare un toast di errore qui se necessario
    } else {
      console.log("Logout effettuato con successo.");
    }
  };

  return (
    // Outer div for background image
    <div
      className="min-h-screen bg-[url('/images/AULA-UNIVERSITA-Imagoeconomica_359058-k7RD--1020x533@IlSole24Ore-Web.jpg')] bg-cover bg-center bg-fixed"
    >
      {/* Inner div for content and overlay */}
      <div className="container mx-auto p-6 bg-white/90 min-h-screen"> {/* Added semi-transparent white background */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          {/* Modificato il titolo qui */}
          <h1 className="text-3xl font-bold text-blue-800 flex items-center">
            <Clock className="mr-3 h-8 w-8" />
            {/* Cambiato il colore di 'Gestione' a text-yellow-500 */}
            <span className="text-yellow-500">Gestione</span> <span className="text-green-600 ml-2">Formazione</span>
          </h1>
          <div className="flex space-x-3">
            <Button onClick={() => navigate('/nuovo-evento')} className="bg-green-600 hover:bg-green-700 text-white">
              <PlusCircle className="mr-2 h-5 w-5" /> Nuovo Evento
            </Button>
            <Button onClick={() => navigate('/calendario')} variant="outline">
              <CalendarDays className="mr-2 h-5 w-5" /> Calendario
            </Button>
            <Button onClick={() => navigate('/statistica')} variant="outline">
              <BarChart2 className="mr-2 h-5 w-5" /> Statistiche
            </Button>
            <Button onClick={() => navigate('/scadenze')} variant="outline"> {/* Nuovo pulsante per le scadenze */}
              <Clock className="mr-2 h-5 w-5" /> Scadenze
            </Button>
            <Button onClick={() => navigate('/archivio')} variant="outline">
              <Archive className="mr-2 h-5 w-5" /> Archivio
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="mr-2 h-5 w-5" /> Log Out
            </Button>
          </div>
        </div>

        {/* Sezione Eventi Attivi */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
               <CalendarDays className="mr-3 h-7 w-7" /> Eventi didattici
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
                           <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${ 
                             event.displayStatus === 'concluso' ? 'bg-blue-700 text-white' : 
                             event.displayStatus === 'in_programma' ? 'bg-green-600 text-white' : 
                             event.displayStatus === 'in_corso' ? 'bg-red-600 text-white' : 
                             'bg-gray-200 text-gray-800' 
                           }`}>
                             {event.displayStatus?.replace('_', ' ') || 'N/D'}
                             {event.displayStatus === 'in_corso' && isEventEndingSoon(event) && ' (in chiusura)'}
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
    </div>
  );
};

export default IndexPage;