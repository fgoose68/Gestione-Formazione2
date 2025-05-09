import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ArrowLeftCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from 'react-day-picker';
import { useEvents } from '@/hooks';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { showError, showSuccess } from '@/utils/toast';
import { Event } from '@/types';

const EditEventPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, updateEvent, loading: eventsLoading } = useEvents();
  
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    teachersRaw: '',
    studentsRaw: ''
  });
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (eventId && events.length > 0) {
      const eventToEdit = events.find(e => e.id === eventId);
      if (eventToEdit) {
        setCurrentEvent(eventToEdit);
        setFormData({
          title: eventToEdit.title,
          description: eventToEdit.description || '',
          location: eventToEdit.location || '',
          teachersRaw: eventToEdit.teachers.join(', '),
          studentsRaw: eventToEdit.students.join('\n')
        });
        setDateRange({
          from: parseISO(eventToEdit.start_date),
          to: parseISO(eventToEdit.end_date)
        });
        setPageLoading(false);
      } else {
        showError("Evento non trovato.");
        navigate('/');
      }
    } else if (eventId && !eventsLoading && events.length === 0) {
        // Se gli eventi sono stati caricati (eventsLoading è false) ma l'array è vuoto
        // e abbiamo un eventId, significa che l'evento non esiste o non appartiene all'utente.
        showError("Evento non trovato o accesso non autorizzato.");
        navigate('/');
        setPageLoading(false);
    }
  }, [eventId, events, navigate, eventsLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!eventId || !currentEvent) {
      showError("Errore: ID evento non disponibile.");
      return;
    }
    if (!formData.title) {
      showError('Il titolo del corso è obbligatorio.');
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      showError('Seleziona un intervallo di date valido.');
      return;
    }

    const updatedEventData = {
      title: formData.title,
      description: formData.description,
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      location: formData.location,
      teachers: formData.teachersRaw.split(',').map(t => t.trim()).filter(t => t),
      students: formData.studentsRaw.split('\n').map(s => s.trim()).filter(s => s)
    };

    const result = await updateEvent(eventId, updatedEventData);
    if (result) {
      showSuccess('Evento aggiornato con successo!');
      navigate(`/evento/${eventId}`); // Torna alla pagina dei dettagli
    }
  };

  if (pageLoading || eventsLoading && !currentEvent) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-gray-700">Caricamento dati evento per la modifica...</p>
      </div>
    );
  }

  if (!currentEvent) {
     return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-red-600">Impossibile caricare i dati dell'evento.</p>
        <Button onClick={() => navigate('/')} className="mt-4"><ArrowLeftCircle className="mr-2 h-5 w-5" />Torna alla Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h1 className="text-3xl font-bold text-blue-800">Modifica Evento Formativo</h1>
            <Button onClick={() => navigate(eventId ? `/evento/${eventId}` : '/')} variant="outline" className="mb-0">
                <ArrowLeftCircle className="mr-2 h-5 w-5" />
                Annulla Modifiche
            </Button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titolo del Corso *</label>
            <Input id="title" name="title" placeholder="Es: Sicurezza sul Lavoro Avanzato" value={formData.title} onChange={handleInputChange} className="text-lg"/>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <Textarea id="description" name="description" placeholder="Dettagli del corso, obiettivi, argomenti trattati..." value={formData.description} onChange={handleInputChange} rows={4} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date e Orari *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${!dateRange && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "PPP", { locale: it })} -{" "}
                        {format(dateRange.to, "PPP", { locale: it })}
                      </>
                    ) : (
                      format(dateRange.from, "PPP", { locale: it })
                    )
                  ) : (
                    <span>Seleziona le date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
            <Input id="location" name="location" placeholder="Indirizzo o 'Online'" value={formData.location} onChange={handleInputChange} />
          </div>
          
          <div>
            <label htmlFor="teachersRaw" className="block text-sm font-medium text-gray-700 mb-1">Docenti</label>
            <Input id="teachersRaw" name="teachersRaw" placeholder="Mario Rossi, Luigi Verdi (separati da virgola)" value={formData.teachersRaw} onChange={handleInputChange} />
          </div>
          
          <div>
            <label htmlFor="studentsRaw" className="block text-sm font-medium text-gray-700 mb-1">Discenti Previsti</label>
            <Textarea id="studentsRaw" name="studentsRaw" placeholder="Nome Cognome 1 (uno per riga)&#10;Nome Cognome 2" value={formData.studentsRaw} onChange={handleInputChange} rows={5} />
          </div>
        </div>
        
        <div className="mt-10 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => navigate(eventId ? `/evento/${eventId}` : '/')} disabled={eventsLoading}>
            Annulla
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSubmit} disabled={eventsLoading}>
            {eventsLoading ? 'Salvataggio...' : 'Salva Modifiche'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;