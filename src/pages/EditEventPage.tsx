import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Importa i componenti Select
import { ArrowLeftCircle, Save, Calendar as CalendarIcon, MapPin, User, Users, FileText, Edit, Tag } from 'lucide-react'; // Aggiunto Tag
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types';
import { showError, showSuccess } from '@/utils/toast';
import { format, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { it } from 'date-fns/locale';

// Tipi di corso disponibili (copiato da NewEvent.tsx)
const COURSE_TYPES: Event['type'][] = ['Centralizzato', 'Periferico', 'Iniziativa', 'e-learning'];


const EditEventPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, loading: eventsLoading, fetchEvents, updateEvent } = useEvents();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    teachersRaw: '',
    studentsRaw: ''
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [courseType, setCourseType] = useState<Event['type'] | undefined>(undefined); // Stato per il tipo di corso
  const [loading, setLoading] = useState(false);

  // Carica i dati dell'evento quando l'ID o la lista eventi cambiano
  useEffect(() => {
    if (eventId && events.length > 0) {
      const currentEvent = events.find(e => e.id === eventId);
      if (currentEvent) {
        setEvent(currentEvent);
        // Prepopola il form con i dati esistenti
        setFormData({
          title: currentEvent.title,
          description: currentEvent.description || '',
          location: currentEvent.location || '',
          teachersRaw: currentEvent.teachers?.join(', ') || '',
          studentsRaw: currentEvent.students?.join('\n') || ''
        });
        // Prepopola il date range picker
        if (currentEvent.start_date && currentEvent.end_date) {
          setDateRange({
            from: parseISO(currentEvent.start_date),
            to: parseISO(currentEvent.end_date)
          });
        }
        // Prepopola il tipo di corso
        setCourseType(currentEvent.type);
      } else {
        showError("Evento non trovato per la modifica.");
        // navigate('/'); // Potrebbe essere troppo aggressivo
      }
    } else if (!eventId && !eventsLoading) {
         showError("ID Evento non specificato per la modifica.");
         navigate('/');
    }
  }, [eventId, events, navigate, eventsLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!eventId || !event) return;

    if (!formData.title) {
      showError('Il titolo del corso è obbligatorio.');
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      showError('Seleziona un intervallo di date valido.');
      return;
    }
     if (!courseType) { // Aggiunta validazione per il tipo di corso
      showError('Seleziona il tipo di corso.');
      return;
    }


    setLoading(true);
    const updatedEventData = {
      ...event, // Mantieni gli altri campi come id, user_id, status, etc.
      title: formData.title,
      description: formData.description,
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      location: formData.location,
      teachers: formData.teachersRaw.split(',').map(t => t.trim()).filter(t => t),
      students: formData.studentsRaw.split('\n').map(s => s.trim()).filter(s => s),
      type: courseType, // Includi il tipo di corso aggiornato
    };

    const result = await updateEvent(eventId, updatedEventData);
    setLoading(false);

    if (result) {
      showSuccess("Evento aggiornato con successo!");
      navigate(`/evento/${eventId}`);
    } else {
       showError("Errore durante l'aggiornamento dell'evento.");
    }
  };

  if (eventsLoading || (!event && eventId)) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-gray-700">Caricamento dati evento per modifica...</p>
      </div>
    );
  }
  
   if (!event && !eventId) {
     return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl text-red-600">ID Evento non specificato per la modifica.</p>
        <Button onClick={() => navigate('/')} className="mt-4"><ArrowLeftCircle className="mr-2 h-5 w-5" />Torna alla Dashboard</Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
           <h1 className="text-3xl font-bold text-blue-800 flex items-center">
             <Edit className="mr-3 h-8 w-8" />
             Modifica Evento
           </h1>
           <Button variant="outline" onClick={() => navigate(`/evento/${eventId}`)} disabled={loading}>
             <ArrowLeftCircle className="mr-2 h-5 w-5" />
             Annulla
           </Button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titolo del Corso *</label>
            <Input id="title" name="title" placeholder="Es: Sicurezza sul Lavoro Avanzato" value={formData.title} onChange={handleInputChange} className="text-lg" disabled={loading}/>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <Textarea id="description" name="description" placeholder="Dettagli del corso, obiettivi, argomenti trattati..." value={formData.description} onChange={handleInputChange} rows={4} disabled={loading}/>
          </div>

           {/* Campo Selezione Tipo Corso */}
          <div>
            <label htmlFor="courseType" className="block text-sm font-medium text-gray-700 mb-1">Tipo di Corso *</label>
            <Select onValueChange={(value: Event['type']) => setCourseType(value)} value={courseType} disabled={loading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona il tipo di corso" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date e Orari *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${!dateRange && "text-muted-foreground"}`}
                  disabled={loading}
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
                <CalendarUI
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
            <Input id="location" name="location" placeholder="Indirizzo o 'Online'" value={formData.location} onChange={handleInputChange} disabled={loading}/>
          </div>
          
          <div>
            <label htmlFor="teachersRaw" className="block text-sm font-medium text-gray-700 mb-1">Docenti</label>
            <Input id="teachersRaw" name="teachersRaw" placeholder="Mario Rossi, Luigi Verdi (separati da virgola)" value={formData.teachersRaw} onChange={handleInputChange} disabled={loading}/>
          </div>
          
          <div>
            <label htmlFor="studentsRaw" className="block text-sm font-medium text-gray-700 mb-1">Discenti Previsti (Elenco Generale)</label>
            <Textarea id="studentsRaw" name="studentsRaw" placeholder="Nome Cognome 1 (uno per riga)&#10;Nome Cognome 2" value={formData.studentsRaw} onChange={handleInputChange} rows={5} disabled={loading}/>
          </div>
        </div>
        
        <div className="mt-10 flex justify-end">
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Modifiche Evento'}
             <Save className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;