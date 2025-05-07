import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, MapPin, Users, Info, ArrowLeftCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { showError } from '@/utils/toast';

const EventDetailPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        showError("ID evento non fornito.");
        setLoading(false);
        navigate('/'); // o a una pagina di errore
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (error) throw error;
        if (!data) {
          showError("Evento non trovato.");
          navigate('/'); // o a una pagina di errore
          return;
        }
        setEvent(data as Event);
      } catch (error: any) {
        showError(`Errore nel caricamento dell'evento: ${error.message}`);
        console.error("Errore fetchEvent:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-gray-700">Caricamento dettagli evento...</p>
        {/* Potresti aggiungere uno Skeleton loader qui */}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-red-600">Evento non trovato o errore nel caricamento.</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          <ArrowLeftCircle className="mr-2 h-5 w-5" />
          Torna alla Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-slate-50 min-h-screen">
      <Button onClick={() => navigate('/')} variant="outline" className="mb-6 bg-white hover:bg-slate-100">
        <ArrowLeftCircle className="mr-2 h-5 w-5 text-blue-700" />
        Torna alla Dashboard
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="bg-blue-700 text-white rounded-t-lg p-6">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Info className="mr-3 h-8 w-8" />
            {event.title}
          </CardTitle>
          {event.description && (
            <CardDescription className="text-blue-100 mt-2 text-base">
              {event.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-orange-500" />
                Periodo di Svolgimento
              </h3>
              <p className="text-gray-700">
                <span className="font-medium">Inizio:</span> {format(parseISO(event.start_date), "EEEE d MMMM yyyy, HH:mm", { locale: it })}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Fine:</span> {format(parseISO(event.end_date), "EEEE d MMMM yyyy, HH:mm", { locale: it })}
              </p>
            </div>
            
            {event.location && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-orange-500" />
                  Luogo
                </h3>
                <p className="text-gray-700">{event.location}</p>
              </div>
            )}
          </div>

          {event.teachers && event.teachers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
                <Users className="mr-2 h-5 w-5 text-orange-500" />
                Docenti Previsti
              </h3>
              <ul className="list-disc list-inside pl-5 text-gray-700 bg-slate-100 p-3 rounded-md">
                {event.teachers.map((teacher, index) => (
                  <li key={index}>{teacher}</li>
                ))}
              </ul>
            </div>
          )}
          
          {event.students && event.students.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
                <Users className="mr-2 h-5 w-5 text-orange-500" />
                Discenti Previsti
              </h3>
              <ul className="list-disc list-inside pl-5 text-gray-700 bg-slate-100 p-3 rounded-md max-h-60 overflow-y-auto">
                {event.students.map((student, index) => (
                  <li key={index}>{student}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
              <Info className="mr-2 h-5 w-5 text-orange-500" />
              Stato Attuale
            </h3>
            <p className={`text-gray-700 font-medium capitalize px-3 py-1 inline-block rounded-full ${
              event.status === 'in_preparazione' ? 'bg-yellow-200 text-yellow-800' :
              event.status === 'completato' ? 'bg-green-200 text-green-800' :
              event.status === 'archiviato' ? 'bg-gray-200 text-gray-800' : ''
            }`}>
              {event.status.replace('_', ' ')}
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetailPage;