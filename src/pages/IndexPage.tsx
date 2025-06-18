import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, PlusCircle, CalendarDays, Archive, BarChart2, Info, LogOut } from 'lucide-react';
import { useEvents, useDeadlines } => '@/hooks';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { isEventEndingSoon } from '@/utils/eventStatus'; // Importa la nuova utility

const IndexPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, loading: eventsLoading } = useEvents();

  // Filtra gli eventi non archiviati per la dashboard e per le scadenze
  const activeEvents = useMemo(() => {
    // Gli eventi con displayStatus 'archiviato' sono già filtrati via dalla logica di useEvents
    // se il filtro iniziale è `event.status !== 'archiviato'`.
    // Qui usiamo direttamente gli eventi con il displayStatus già calcolato.
    return events.filter(event => event.displayStatus !== 'archiviato');
  }, [events]);

  // Usa l'hook useDeadlines passando SOLO gli eventi attivi
  const { deadlines } = useDeadlines(activeEvents);

  // Filtra le scadenze imminenti (oggi o future) dagli eventi attivi
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    return deadlines
      .filter(d => !d.completed && (isToday(d.date) || d.date > today))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [deadlines]);

  // Filtra le scadenze imminenti per tipo di corso
  const standardDeadlines = useMemo(() => {
    const standardTypes = ['docente', 'discenti_standard', 'avvio_standard', 'giorno_evento_registri', 'post_evento_feedback', 'post_evento_modello_l'];
    return upcomingDeadlines.filter(d => standardTypes.includes(d.type));
  }, [upcomingDeadlines]);

  const elearningDeadlines = useMemo(() => {
    const elearningTypes = ['discenti_elearning', 'comunicazione_scuola', 'lettera_abilitazione', 'mail_sollecito_1', 'mail_sollecito_2', 'avviso_proroga', 'relazione_finale'];
    return upcomingDeadlines.filter(d => elearningTypes.includes(d.type));
  }, [upcomingDeadlines]);


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Errore durante il logout:", error);
      // Potresti mostrare un toast di errore qui se necessario
    } else {
      console.log("Logout effettuato con successo.");
    }
  };

  // Dati statici per la tabella delle scadenze standard
  const staticStandardDeadlines = [
    { type: 'Richiesta Docenti', days: '30 giorni prima', message: 'Redigere richiesta docenti' },
    { type: 'Richiesta Discenti', days: '25 giorni prima', message: 'Creare richiesta discenti' },
    { type: 'Avvio Corso', days: '10 giorni prima', message: 'Preparare Avvio Corso' },
    { type: 'Gestione Registri', days: 'Giorno dell\'evento', message: 'Gestire registri' },
    { type: 'Raccolta Feedback', days: '1 giorno dopo fine', message: 'Raccogliere feedback' },
    { type: 'Generazione Modello L', days: '2 giorni dopo fine', message: 'Generare Modello L' },
    { type: '', days: '', message: '' }, // Riga vuota aggiunta per allineamento
  ];

  // Dati statici per la tabella delle scadenze e-learning
  const staticElearningDeadlines = [
    { type: 'Richiesta Discenti', days: '5 giorni prima', message: 'Richiesta discenti (e-learning)' },
    { type: 'Comunicazione Scuola', days: '3 giorni prima', message: 'Comunicazione alla Scuola PEF/Altro' },
    { type: 'Lettera Abilitazione', days: '1 giorno prima', message: 'Lettera Abilitazione al Corso' },
    { type: 'Mail Sollecito 1', days: '15 giorni dopo inizio', message: 'Prima mail di sollecito' },
    { type: 'Mail Sollecito 2', days: '25 giorni dopo inizio', message: 'Seconda mail di sollecito' },
    { type: 'Avviso Proroga', days: '1 giorno dopo fine', message: 'Avviso Proroga (eventuale)' },
    { type: 'Relazione Finale', days: '30 giorni dopo inizio', message: 'Relazione Finale' },
  ];


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
            <Button onClick={() => navigate('/archivio')} variant="outline">
              <Archive className="mr-2 h-5 w-5" /> Archivio
            </Button>
            <Button onClick={() => navigate('/statistica')} variant="outline">
              <BarChart2 className="mr-2 h-5 w-5" /> Statistiche
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="mr-2 h-5 w-5" /> Log Out
            </Button>
          </div>
        </div>

        {/* Sezione Eventi Attivi (Spostata sopra) */}
        <Card className="shadow-lg mb-8"> {/* Aggiunto mb-8 per spaziatura */}
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
                        {/* Modificato il formato data qui */}
                        <TableCell>{format(parseISO(event.start_date), "PPP", { locale: it })} - {format(parseISO(event.end_date), "PPP", { locale: it })}</TableCell>
                        <TableCell>{event.location || 'N/D'}</TableCell>
                        <TableCell>
                           <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${ 
                             event.displayStatus === 'concluso' ? 'bg-blue-700 text-white' : // Blu per concluso
                             event.displayStatus === 'in_programma' ? 'bg-green-600 text-white' : // Verde per in programma
                             event.displayStatus === 'in_corso' ? 'bg-red-600 text-white' : // Rosso intenso per in corso
                             'bg-gray-200 text-gray-800' // Fallback
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


        {/* Sezione Scadenze Imminenti - Divisa in due colonne (Spostata sotto) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Colonna Sinistra: Scadenze Corsi Standard */}
          <Card className="shadow-lg bg-yellow-50"> {/* Aggiunto bg-yellow-50 qui */}
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
                <Info className="mr-3 h-7 w-7" /> Scadenze Corsi Standard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tabella delle scadenze standard */}
              <div className="mb-6 overflow-x-auto h-[360px]"> {/* Aggiunta altezza fissa */}
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Regole Scadenze Standard</h4>
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Tipo Scadenza</TableHead>
                      <TableHead className="text-center font-semibold">Periodo</TableHead>
                      <TableHead className="font-semibold">Azione</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staticStandardDeadlines.map((deadline, index) => (
                      <TableRow key={index} className={deadline.type === '' ? 'h-12' : ''}> {/* Aggiunto classe per riga vuota */}
                        <TableCell className="font-medium">{deadline.type}</TableCell>
                        <TableCell className="text-center">{deadline.days}</TableCell>
                        <TableCell>{deadline.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <h4 className="text-lg font-semibold text-gray-700 mb-3">Scadenze Imminenti</h4>
              {eventsLoading ? (
                <p className="text-center text-gray-600">Caricamento scadenze...</p>
              ) : standardDeadlines.length > 0 ? (
                <div className="space-y-4">
                  {standardDeadlines.map((deadline, index) => (
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
                <p className="text-center text-gray-600">Nessuna scadenza imminente per corsi standard.</p>
              )}
            </CardContent>
          </Card>

          {/* Colonna Destra: Scadenze E-learning */}
          <Card className="shadow-lg bg-green-50"> {/* Aggiunto bg-green-50 qui */}
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
                <Info className="mr-3 h-7 w-7" /> Scadenze Corsi E-learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tabella delle scadenze e-learning */}
              <div className="mb-6 overflow-x-auto h-[360px]"> {/* Aggiunta altezza fissa */}
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Regole Scadenze E-learning</h4>
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Tipo Scadenza</TableHead>
                      <TableHead className="text-center font-semibold">Periodo</TableHead>
                      <TableHead className="font-semibold">Azione</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staticElearningDeadlines.map((deadline, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{deadline.type}</TableCell>
                        <TableCell className="text-center">{deadline.days}</TableCell>
                        <TableCell>{deadline.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <h4 className="text-lg font-semibold text-gray-700 mb-3">Scadenze Imminenti</h4>
              {eventsLoading ? (
                <p className="text-center text-gray-600">Caricamento scadenze...</p>
              ) : elearningDeadlines.length > 0 ? (
                <div className="space-y-4">
                  {elearningDeadlines.map((deadline, index) => (
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
                <p className="text-center text-gray-600">Nessuna scadenza imminente per corsi e-learning.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;