import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, Archive, CalendarDays, MapPin, Info, RotateCcw } from "lucide-react"; // Aggiunto RotateCcw per ripristino
import { useEvents } from "@/hooks"; // Importa useEvents
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'; // Importa componenti Card
import { format, parseISO } from 'date-fns'; // Importa funzioni per formattare date
import { it } from 'date-fns/locale'; // Importa locale italiano
import { Event } from '@/types'; // Importa il tipo Event
import { showError, showSuccess } from '@/utils/toast'; // Importa toast

const ArchivePage = () => {
  const navigate = useNavigate();
  const { events, loading: eventsLoading, updateEventStatus } = useEvents(); // Usa useEvents

  // Filtra gli eventi per mostrare solo quelli archiviati
  const archivedEvents = events.filter(event => event.status === 'archiviato');

  // Funzione per ripristinare un evento dall'archivio
  const handleUnarchiveEvent = async (eventId: string) => {
    // Chiamiamo updateEventStatus per cambiare lo stato da 'archiviato' a 'in_preparazione'
    const result = await updateEventStatus(eventId, 'in_preparazione');
    if (result) {
      showSuccess("Evento ripristinato con successo!");
      // Non è necessario navigare, useEvents aggiornerà la lista automaticamente
    } else {
      showError("Errore durante il ripristino dell'evento.");
    }
  };


  if (eventsLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Caricamento archivio...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800 flex items-center">
          <Archive className="mr-3 h-8 w-8" />
          Archivio Eventi
        </h1>
        <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-blue-50">
          <Home className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-xl p-6">
        {archivedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedEvents.map((event: Event) => (
              <Card key={event.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                 <CardHeader>
                    <CardTitle className="text-xl text-blue-800">{event.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(event.start_date), "PPP", { locale: it })} - {format(parseISO(event.end_date), "PPP", { locale: it })}
                    </p>
                 </CardHeader>
                 <CardContent className="flex-grow">
                    {event.type && <p className="text-sm text-gray-600 mb-1">Tipo: <span className="font-medium">{event.type}</span></p>}
                    {event.location && <p className="text-xs text-gray-500"><MapPin className="inline h-3 w-3 mr-1"/>{event.location}</p>}
                 </CardContent>
                 <CardFooter className="border-t pt-4 flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/evento/${event.id}`)}>
                       <Info className="mr-2 h-4 w-4"/> Dettagli
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600" onClick={() => handleUnarchiveEvent(event.id)}>
                       <RotateCcw className="mr-1 h-4 w-4" /> Ripristina
                    </Button>
                 </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Nessun evento archiviato.</p>
        )}
      </div>
    </div>
  );
};

export default ArchivePage;