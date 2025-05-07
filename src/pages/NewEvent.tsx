import { Calendar as CalendarIcon, MapPin, User, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar'; // Shadcn Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { showError } from '@/utils/toast';

const NewEvent = () => {
  const { addEvent, loading } = useEvents();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    teachersRaw: '', // Per input testuale
    studentsRaw: ''  // Per input testuale
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      showError('Il titolo del corso è obbligatorio.');
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      showError('Seleziona un intervallo di date valido.');
      return;
    }

    const newEventData = {
      title: formData.title,
      description: formData.description,
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      location: formData.location,
      teachers: formData.teachersRaw.split(',').map(t => t.trim()).filter(t => t), // Array di stringhe
      students: formData.studentsRaw.split('\n').map(s => s.trim()).filter(s => s)  // Array di stringhe
    };

    const result = await addEvent(newEventData);
    if (result) {
      navigate('/'); // Torna alla dashboard dopo la creazione
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 border-b pb-4">Crea Nuovo Evento Formativo</h1>
        
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
          <Button variant="outline" onClick={() => navigate('/')} disabled={loading}>
            Annulla
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Evento'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewEvent;