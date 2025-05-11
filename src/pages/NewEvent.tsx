import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents } // Assicurati che sia l'hook corretto, probabilmente useEvents che ha addEvent
from '@/hooks'; // o from '@/hooks/useEvents';
import { format } from 'date-fns';
import { it } from 'date-fns/locale'; // Importa il locale italiano
import { DateRange } from 'react-day-picker';

const NewEvent = () => {
  // Se l'hook si chiama useEvents e fornisce addEvent, usa quello.
  // Se hai un hook separato useEvent che fornisce addEvent, assicurati che sia corretto.
  const { addEvent, loading } = useEvents(); 
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'centralizzato' as 'centralizzato' | 'periferico' | 'iniziativa' | 'e-learning',
    teachers: '', 
    students: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: 'centralizzato' | 'periferico' | 'iniziativa' | 'e-learning') => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = async () => {
    console.log("Dati del modulo prima della validazione:", formData); // Log per debug

    if (!formData.title.trim()) { // Aggiunto .trim() per la validazione
      alert('Il titolo del corso è obbligatorio');
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      alert('Seleziona un intervallo di date valido');
      return;
    }

    // Creazione dell'oggetto newEvent usando ESCLUSIVAMENTE formData
    const newEventData = {
      title: formData.title,
      description: formData.description,
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      location: formData.location, // Assicurati che qui ci sia formData
      type: formData.type,
      teachers: formData.teachers.split(',').map(t => t.trim()).filter(t => t),
      students: formData.students.split('\n').map(s => s.trim()).filter(s => s)
      // completed_tasks: [], // Se necessario, inizializza qui
      // status: 'in_preparazione', // Se addEvent non lo imposta di default
    };

    console.log("Oggetto evento da inviare:", newEventData); // Log per debug

    try {
      const result = await addEvent(newEventData); 
      if (result) {
        navigate('/');
      } else {
        // Potrebbe essere utile un feedback se addEvent restituisce null/false in caso di errore gestito
        alert("Errore durante la creazione dell'evento. Controlla la console per i dettagli.");
      }
    } catch (error) {
      console.error("Errore imprevisto durante la creazione dell'evento:", error);
      alert("Si è verificato un errore imprevisto. Controlla la console.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Crea Nuovo Evento</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titolo del corso *</label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Es. Sicurezza sul lavoro"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Descrizione dettagliata del corso"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo di corso *</label>
            <Select 
              value={formData.type}
              onValueChange={handleTypeChange} // Corretto: usa handleTypeChange
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Seleziona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="centralizzato">Centralizzato</SelectItem>
                <SelectItem value="periferico">Periferico</SelectItem>
                <SelectItem value="iniziativa">Iniziativa</SelectItem>
                <SelectItem value="e-learning">E-learning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal" id="dateRange">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, 'PPP', { locale: it })} - ${format(dateRange.to, 'PPP', { locale: it })}`
                    ) : (
                      format(dateRange.from, 'PPP', { locale: it })
                    )
                  ) : (
                    <span>Seleziona le date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
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
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Indirizzo o online"
            />
          </div>

          <div>
            <label htmlFor="teachers" className="block text-sm font-medium text-gray-700 mb-1">Docenti</label>
            <Textarea
              id="teachers"
              name="teachers"
              value={formData.teachers}
              onChange={handleInputChange}
              placeholder="Nome Cognome 1, Nome Cognome 2 (separati da virgola)"
              rows={2}
            />
          </div>

          <div>
            <label htmlFor="students" className="block text-sm font-medium text-gray-700 mb-1">Discenti</label>
            <Textarea
              id="students"
              name="students"
              value={formData.students}
              onChange={handleInputChange}
              placeholder="Nome Cognome 1 (uno per riga)&#10;Nome Cognome 2"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => navigate('/')} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Crea Evento'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewEvent;