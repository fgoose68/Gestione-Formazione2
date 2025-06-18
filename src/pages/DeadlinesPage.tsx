import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Home, Clock, Info, CalendarDays } from 'lucide-react';
import { useEvents, useDeadlines } from '@/hooks';
import { format, parseISO, isToday, isPast, isFuture } from 'date-fns';
import { it } from 'date-fns/locale';
import { Event, Deadline } from '@/types'; // Importa i tipi per maggiore chiarezza

// Dati statici per la tabella delle scadenze standard (copiati da IndexPage.tsx)
const staticStandardDeadlines = [
  { type: 'Richiesta Docenti', days: '30 giorni prima', message: 'Redigere richiesta docenti' },
  { type: 'Richiesta Discenti', days: '25 giorni prima', message: 'Creare richiesta discenti' },
  { type: 'Avvio Corso', days: '10 giorni prima', message: 'Preparare Avvio Corso' },
  { type: 'Gestione Registri', days: 'Giorno dell\'evento', message: 'Gestire registri' },
  { type: 'Raccolta Feedback', days: '1 giorno dopo fine', message: 'Raccogliere feedback' },
  { type: 'Generazione Modello L', days: '2 giorni dopo fine', message: 'Generare Modello L' },
];

// Dati statici per la tabella delle scadenze e-learning (copiati da IndexPage.tsx)
const staticElearningDeadlines = [
  { type: 'Richiesta Discenti', days: '8 giorni prima', message: 'Richiesta discenti (e-learning)' },
  { type: 'Comunicazione Scuola', days: '7 giorni prima', message: 'Comunicazione alla Scuola PEF/Altro' },
  { type: 'Lettera Abilitazione', days: '1 giorno prima', message: 'Lettera Abilitazione al Corso' },
  { type: 'Mail Sollecito 1', days: '15 giorni dopo inizio', message: 'Prima mail di sollecito' },
  { type: 'Mail Sollecito 2', days: '25 giorni dopo inizio', message: 'Seconda mail di sollecito' },
  { type: 'Avviso Proroga', days: '1 giorno dopo fine', message: 'Avviso Proroga (eventuale)' },
  { type: 'Relazione Finale', days: '30 giorni dopo inizio', message: 'Relazione Finale' },
];

const DeadlinesPage = () => {
  const navigate = useNavigate();
  const { events, loading: eventsLoading } = useEvents();
  // Passa tutti gli eventi a useDeadlines per ottenere tutte le scadenze
  const { deadlines, upcomingDeadlines, pastDeadlines, todayDeadlines } = useDeadlines(events);

  // Ordina le scadenze per una visualizzazione consistente
  const sortedUpcomingDeadlines = useMemo(() => 
    upcomingDeadlines.sort((a, b) => a.date.getTime() - b.date.getTime()), 
    [upcomingDeadlines]
  );
  const sortedTodayDeadlines = useMemo(() => 
    todayDeadlines.sort((a, b) => a.date.getTime() - b.date.getTime()), 
    [todayDeadlines]
  );

  // Filtra le scadenze imminenti per tipo di corso
  const standardUpcomingDeadlines = useMemo(() => {
    const standardTypes: Deadline['type'][] = ['docente', 'discenti_standard', 'avvio_standard', 'giorno_evento_registri', 'post_evento_feedback', 'post_evento_modello_l'];
    return sortedUpcomingDeadlines.filter(d => standardTypes.includes(d.type));
  }, [sortedUpcomingDeadlines]);

  const elearningUpcomingDeadlines = useMemo(() => {
    const elearningTypes: Deadline['type'][] = ['discenti_elearning', 'comunicazione_scuola', 'lettera_abilitazione', 'mail_sollecito_1', 'mail_sollecito_2', 'avviso_proroga', 'relazione_finale'];
    return sortedUpcomingDeadlines.filter(d => elearningTypes.includes(d.type));
  }, [sortedUpcomingDeadlines]);


  if (eventsLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-gray-700">Caricamento scadenze...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800 flex items-center">
          <Clock className="mr-3 h-8 w-8" />
          Tutte le Scadenze
        </h1>
        <Button onClick={() => navigate('/')} className="bg-yellow-400 hover:bg-yellow-500 text-black">
          <Home className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
      </div>

      {/* Sezione Regole Statiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Regole Scadenze Corsi Standard */}
        <Card className="shadow-lg bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
              <Info className="mr-3 h-7 w-7" /> Regole Scadenze Corsi Standard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Tipo Scadenza</TableHead>
                    <TableHead className="text-center font-semibold">Periodo</TableHead>
                    <TableHead className="font-semibold">Azione</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staticStandardDeadlines.map((deadline, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{deadline.type}</TableCell>
                      <TableCell className="text-center">{deadline.days}</TableCell>
                      <TableCell>{deadline.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Regole Scadenze Corsi E-learning */}
        <Card className="shadow-lg bg-green-50">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
              <Info className="mr-3 h-7 w-7" /> Regole Scadenze Corsi E-learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
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
          </CardContent>
        </Card>
      </div>

      {/* Sezioni Scadenze Dinamiche */}
      <div className="space-y-8">
        {/* Scadenze di Oggi */}
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><CalendarDays className="mr-3 h-7 w-7" /> Scadenze di Oggi</CardTitle></CardHeader>
          <CardContent>
            {sortedTodayDeadlines.length > 0 ? (
              <div className="space-y-4">
                {sortedTodayDeadlines.map((deadline, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-yellow-100 border-yellow-400 hover:bg-yellow-200 transition-colors cursor-pointer"
                       onClick={() => navigate(`/evento/${deadline.eventId}`)}>
                    <p className="font-medium text-gray-800">{deadline.message}</p>
                    <p className="text-sm text-yellow-700 font-semibold">
                      Scadenza: {format(deadline.date, "PPP", { locale: it })} ({format(deadline.date, "EEEE", { locale: it })})
                    </p>
                    <p className="text-xs text-gray-600">Evento: {deadline.eventTitle}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">Nessuna scadenza per oggi.</p>
            )}
          </CardContent>
        </Card>

        {/* Scadenze Imminenti Corsi Standard */}
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><CalendarDays className="mr-3 h-7 w-7" /> Scadenze Imminenti Corsi Standard</CardTitle></CardHeader>
          <CardContent>
            {standardUpcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {standardUpcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50 border-gray-200 hover:bg-slate-100 transition-colors cursor-pointer"
                       onClick={() => navigate(`/evento/${deadline.eventId}`)}>
                    <p className="font-medium text-gray-800">{deadline.message}</p>
                    <p className="text-sm text-gray-500">
                      Scadenza: {format(deadline.date, "PPP", { locale: it })} ({format(deadline.date, "EEEE", { locale: it })})
                    </p>
                    <p className="text-xs text-gray-600">Evento: {deadline.eventTitle}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">Nessuna scadenza imminente per corsi standard.</p>
            )}
          </CardContent>
        </Card>

        {/* Scadenze Imminenti Corsi E-learning */}
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><CalendarDays className="mr-3 h-7 w-7" /> Scadenze Imminenti Corsi E-learning</CardTitle></CardHeader>
          <CardContent>
            {elearningUpcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {elearningUpcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50 border-gray-200 hover:bg-slate-100 transition-colors cursor-pointer"
                       onClick={() => navigate(`/evento/${deadline.eventId}`)}>
                    <p className="font-medium text-gray-800">{deadline.message}</p>
                    <p className="text-sm text-gray-500">
                      Scadenza: {format(deadline.date, "PPP", { locale: it })} ({format(deadline.date, "EEEE", { locale: it })})
                    </p>
                    <p className="text-xs text-gray-600">Evento: {deadline.eventTitle}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">Nessuna scadenza imminente per corsi E-learning.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeadlinesPage;