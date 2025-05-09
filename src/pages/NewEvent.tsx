import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react'; // Using lucide-react icons instead of liquor-icons
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvent } from '@/hooks/useEvent';
import { format } from 'date-fns';

const NewEvent = () => {
  const { addEvent, loading } = useEvent();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

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
      location: formedData.location,
      type: formData.type,
      teachers: formData.teachers.split(',').map(t => t.trim()).filter(t => t),
      students: formData.students.split('\n').map(s => s.trim()).filter(s => s)
    };

    const result = await addEvent(newEvent);
    if (result) {
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Crea Nuovo Evento</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo del corso *</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Es. Sicurezza sul lavoro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo di corso *</label>
            <Select 
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
            >
              <SelectTrigger>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Indirizzo o online"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Docenti</label>
            <Textarea
              name="teachers"
              value={formData.teachers}
              onChange={handleInputChange}
              placeholder="Nome Cognome 1, Nome Cognome 2"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discenti</label>
            <Textarea
              name="students"
              value={formData.students}
              onChange={handleInputChange}
              placeholder="Nome Cognome 1, Nome Cognome 2"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => navigate('/')}>
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