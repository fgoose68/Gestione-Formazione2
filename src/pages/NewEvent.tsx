import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'liquor-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvent } from '@/hooks/useEvent';

const NewEvent = () => {
  const { addEvent, loading } = useEvent();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'centralizzato' as const,
    teachersRaw: '',
    studentsRaw: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: 'centralizzato' | 'periferico' | 'iniziativa' | 'e-learning') => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      alert('Il titolo del corso è obbligatorio');
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      alert('Seleziona un intervallo di date valido');
      return;
    }

    const newEvent = {
      title: formData.title,
      description: formData.description,
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      location: formData.location,
      type: formData.type,
      teachers: formData.teachersRaw.split(',').map(t => t.trim()).filter(t => t),
      students: formData.studentsRaw.split('\n').map(s => s.trim()).filter(s => s)
    };

    const result = await addEvent(newEvent);
    if (result) {
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">Crea Nuovo Evento</h1>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titolo del corso *</label>
            <Input id="title" name="title" placeholder="Es. Sicurezza sul lavoro" value={formData.title} onChange={handleInputChange} />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <Textarea id="description" name="description" placeholder="Descrizione del corso" value={formData.description} onChange={handleInputChange} rows={4} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo di corso *</label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona tipo corso" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`
                    ) : (
                      format(dateRange.from, 'PPP')
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
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
            <Input id="location" name="location" placeholder="Indirizzo o online" value={formData.location} onChange={handleInputChange} />
          </div>
          
          <div>
            <label html="teachersRaw" className="block text-sm font-medium text-gray-700 mb-1">Docenti</label>
            <Input id="teachersRaw" name="teachersRaw" placeholder="Nome Cognome 1, Nome Cognome 2" value={formData.teachersRaw} onChange={handleInputChange} />
          </div>
          
          <div>
            <label html="studentsRaw" className="block text-sm font-medium text-gray-700 mb-1">Discenti</label>
            <Textarea id="studentsRaw" name="studentsRaw" placeholder="Nome Cognome 1\nNome Cognome 2" value={formData.studentsRaw} onChange={handleInputChange} rows={5} />
          </div>
        </div>
        
        <div className="mt-10 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => navigate('/')} disabled={loading}>
            Annulla
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Crea Evento'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewEvent;