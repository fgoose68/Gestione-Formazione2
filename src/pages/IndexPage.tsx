import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, PlusCircle, CalendarDays, Archive, BarChart2, Info, LogOut, FileText } from "lucide-react";
import { useEvents } from "@/hooks";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { isEventEndingSoon } from "@/utils/eventStatus";

const IndexPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, loading: eventsLoading } = useEvents();
  
  // Stato per il filtro selezionato
  const [filter, setFilter] = useState<'all' | 'in_corso' | 'in_programma' | 'concluso'>('all');

  // Stato per l'anno di svolgimento
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Filtra gli eventi non archiviati per la dashboard
  const activeEvents = useMemo(() => {
    return events.filter(event => event.displayStatus !== 'archiviato');
  }, [events]);

  // Applica il filtro selezionato
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return activeEvents;
    return activeEvents.filter(event => event.displayStatus === filter);
  }, [activeEvents, filter]);

  // Eventi per ciascuno stato di visualizzazione
  const inCorsoEvents = useMemo(() => {
    return activeEvents.filter(event => event.displayStatus === 'in_corso');
  }, [activeEvents]);

  const inProgrammaEvents = useMemo(() => {
    return activeEvents.filter(event => event.displayStatus === 'in_programma');
  }, [activeEvents]);

  const conclusoEvents = useMemo(() => {
    return activeEvents.filter(event => event.displayStatus === 'concluso');
  }, [activeEvents]);

  // Filtra gli eventi conclusi per anno basandosi sulla data di fine (end_date)
  const filteredConclusi = useMemo(() => {
    if (!selectedYear) return conclusoEvents;
    return conclusoEvents.filter(e => {
      const endYear = format(parseISO(e.end_date), "yyyy");
      return endYear === selectedYear;
    });
  }, [selectedYear, conclusoEvents]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Errore durante il logout:", error);
    } else {
      console.log("Logout effettuato con successo.");
    }
  };

  const renderEventTable = (eventsToRender: typeof activeEvents) => {
    const eventsToDisplay = filter === 'all' ? eventsToRender : filteredEvents.filter(e => e.displayStatus === eventsToRender[0]?.displayStatus || filter === e.displayStatus);
    
    if (eventsToDisplay.length === 0) {
      return <p className="text-center text-gray-600">Nessun evento trovato per questo stato.</p>;
    }

    return (
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
            {eventsToDisplay.map((event) => (
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
    );
  };

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
            <Button onClick={() => navigate('/')} variant="destructive">
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

        {/* Selezione anno per gli eventi conclusi */}
        {filter === 'concluso' && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Button 
              variant={selectedYear === '2025' ? "default" : "outline"} 
              onClick={() => setSelectedYear('2025')}
            >
              2025
            </Button>
            <Button 
              variant={selectedYear === '2026' ? "default" : "outline"} 
              onClick={() => setSelectedYear('2026')}
            >
              2026
            </Button>
            <Button 
              variant={selectedYear === '2027' ? "default" : "outline"} 
              onClick={() => setSelectedYear('2027')}
            >
              2027
            </Button>
            <Button 
              variant={selectedYear === '2028' ? "default" : "outline"} 
              onClick={() => setSelectedYear('2028')}
            >
              2028
            </Button>
          </div>
        )}

        {eventsLoading ? (
          <p className="text-center text-gray-600 text-xl">Caricamento eventi...</p>
        ) : (
          <div className="space-y-8">
            {/* Sezione Eventi In Corso */}
            {(filter === 'all' || filter === 'in_corso') && (
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
            )}

            {/* Sezione Eventi In Programma */}
            {(filter === 'all' || filter === 'in_programma') && (
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
            )}

            {/* Sezione Eventi Conclusi con filtro anno */}
            {(filter === 'all' || filter === 'concluso') && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
                    <CalendarDays className="mr-3 h-7 w-7 text-blue-700" /> Eventi Conclusi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredConclusi.length > 0 ? (
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
                          {filteredConclusi.map((event) => (
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
                    <p className="text-center text-gray-600">Nessun evento concluso per l'anno selezionato.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;