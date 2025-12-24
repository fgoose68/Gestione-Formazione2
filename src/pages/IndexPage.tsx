import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, PlusCircle, CalendarDays, Archive, BarChart2, Info, LogOut, FileText } from 'lucide-react';
import { useEvents } from '@/hooks';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { isEventEndingSoon } from '@/utils/eventStatus';

const IndexPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, loading: eventsLoading } = useEvents();
  
  // Stato per il filtro selezionato
  const [filter, setFilter] = useState<'all' | 'in_sospeso' | 'in_corso' | 'in_programma' | 'concluso'>('all');

  // Filtra gli eventi non archiviati per la dashboard
  const activeEvents = useMemo(() => {
    return events.filter(event => event.status !== 'archiviato');
  }, [events]);

  // Applica il filtro selezionato
  const filteredEvents = useMemo(() => {
    switch (filter) {
      case 'in_sospeso':
        return activeEvents.filter(event => event.status === 'in_preparazione');
      case 'in_corso':
        return activeEvents.filter(event => event.displayStatus === 'in_corso');
      case 'in_programma':
        return activeEvents.filter(event => event.displayStatus === 'in_programma');
      case 'concluso':
        return activeEvents.filter(event => event.displayStatus === 'concluso');
      default: // 'all'
        return activeEvents;
    }
  }, [activeEvents, filter]);

  // Suddividi gli eventi filtrati per stato di visualizzazione (per le sezioni)
  const inSospesoEvents = useMemo(() => {
    return filteredEvents.filter(event => event.status === 'in_preparazione');
  }, [filteredEvents]);

  const inCorsoEvents = useMemo(() => {
    return filteredEvents.filter(event => event.displayStatus === 'in_corso');
  }, [filteredEvents]);

  const inProgrammaEvents = useMemo(() => {
    return filteredEvents.filter(event => event.displayStatus === 'in_programma');
  }, [filteredEvents]);

  const conclusoEvents = useMemo(() => {
    return filteredEvents.filter(event => event.displayStatus === 'concluso');
  }, [filteredEvents]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Errore durante il logout:", error);
      // Potresti mostrare un toast di errore qui se necessario
    } else {
      console.log("Logout effettuato con successo.");
    }
  };

  const renderEventTable = (eventsToRender: typeof filteredEvents) => (
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
          {eventsToRender.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>
                {event.start_date ? format(parseISO(event.start_date), "PPP", { locale: it }) : 'N/D'} 
                {event.end_date ? ` - ${format(parseISO(event.end_date), "PPP", { locale: it })}` : ''}
              </TableCell>
              <TableCell>{event.location || 'N/D'}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                  event.status === 'in_preparazione' ? 'bg-yellow-500 text-black' :
                  event.displayStatus === 'concluso' ? 'bg-blue-700 text-white' :
                  event.displayStatus === 'in_programma' ? 'bg-green-600 text-white' :
                  event.displayStatus === 'in_corso' ? 'bg-red-600 text-white' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {event.status === 'in_preparazione' ? 'In sospeso (Bozza)' : 
                   event.displayStatus?.replace('_', ' ') || 'N/D'}
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
  );

  return (
    <div className="min-h-screen bg-[url('/images/AULA-UNIVERSITA-Imagoeconomica_359058-k7RD--1020x533@IlSole24Ore-Web.jpg')] bg-cover bg-center bg-fixed">
      <div className="container mx-auto p-6 bg-white/90 min-h-screen">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-800 flex items-center">
            <Clock className="mr-3 h-8 w-8" />
            <span className="text-yellow-500">Gestione</span>
            <span className="text-green-600 ml-2">Formazione</span>
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
            <Button onClick={() => navigate('/scadenze')} variant="outline">
              <Clock className="mr-2 h-5 w-5" /> Scadenze
            </Button>
            <Button onClick={() => navigate('/modelli-l')} variant="outline">
              <FileText className="mr-2 h-5 w-5" /> Modelli L
            </Button>
            <Button onClick={() => navigate('/archivio')} variant="outline">
              <Archive className="mr-2 h-5 w-5" /> Archivio
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="mr-2 h-5 w-5" /> Log Out
            </Button>
          </div>
        </div>

        {/* Filtri */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button 
            variant={filter === 'all' ? "default" : "outline"} 
            onClick={() => setFilter('all')}
            className={filter === 'all' ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            Tutti gli Eventi
          </Button>
          <Button 
            variant={filter === 'in_sospeso' ? "default" : "outline"} 
            onClick={() => setFilter('in_sospeso')}
            className={filter === 'in_sospeso' ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}
          >
            In Sospeso (Bozza)
          </Button>
          <Button 
            variant={filter === 'in_corso' ? "default" : "outline"} 
            onClick={() => setFilter('in_corso')}
            className={filter === 'in_corso' ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            In Corso
          </Button>
          <Button 
            variant={filter === 'in_programma' ? "default" : "outline"} 
            onClick={() => setFilter('in_programma')}
            className={filter === 'in_programma' ? "bg-green-600 hover:bg-green-700 text-white" : ""}
          >
            In Programma
          </Button>
          <Button 
            variant={filter === 'concluso' ? "default" : "outline"} 
            onClick={() => setFilter('concluso')}
            className={filter === 'concluso' ? "bg-blue-700 hover:bg-blue-800 text-white" : ""}
          >
            Conclusi
          </Button>
        </div>

        {eventsLoading ? (
          <p className="text-center text-gray-600 text-xl">Caricamento eventi...</p>
        ) : (
          <div className="space-y-8">
            {/* Sezione Eventi In Sospeso (Bozza) */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
                  <Info className="mr-3 h-7 w-7 text-yellow-500" /> Eventi In Sospeso (Bozza)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inSospesoEvents.length > 0 ? (
                  renderEventTable(inSospesoEvents)
                ) : (
                  <p className="text-center text-gray-600">Nessun evento in sospeso.</p>
                )}
              </CardContent>
            </Card>

            {/* Sezione Eventi In Corso */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
                  <CalendarDays className="mr-3 h-7 w-7 text-red-600" /> Eventi In Corso
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inCorsoEvents.length > 0 ? (
                  renderEventTable(inCorsoEvents)
                ) : (
                  <p className="text-center text-gray-600">Nessun evento in corso.</p>
                )}
              </CardContent>
            </Card>

            {/* Sezione Eventi In Programma */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
                  <CalendarDays className="mr-3 h-7 w-7 text-green-600" /> Eventi In Programma
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inProgrammaEvents.length > 0 ? (
                  renderEventTable(inProgrammaEvents)
                ) : (
                  <p className="text-center text-gray-600">Nessun evento in programma.</p>
                )}
              </CardContent>
            </Card>

            {/* Sezione Eventi Conclusi */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
                  <CalendarDays className="mr-3 h-7 w-7 text-blue-700" /> Eventi Conclusi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conclusoEvents.length > 0 ? (
                  renderEventTable(conclusoEvents)
                ) : (
                  <p className="text-center text-gray-600">Nessun evento concluso.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;