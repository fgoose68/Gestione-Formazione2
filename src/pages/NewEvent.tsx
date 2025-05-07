import { useEvents } from '@/hooks';
import { Calendar, MapPin, User, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useNavigate } from 'react-router-dom';

const NewEvent = () => {
  const { addEvent } = useEvents();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    teachers: '',
    students: ''
  });

  const handleSubmit = async () => {
    if (!dateRange?.from || !dateRange.to) {
      alert('Seleziona un intervallo di date valido');
      return;
    }

    const newEvent = await addEvent({
      ...formData,
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      teachers: formData.teachers.split(',').map(t => t.trim()),
      students: formData.students.split('\n').map(s => s.trim())
    });

    if (newEvent) {
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Crea Nuovo Evento Formativo</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sezione Informazioni Base */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="mr-2" /> Informazioni Evento
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titolo del Corso</label>
                <Input 
                  placeholder="Es: Sicurezza sul Lavoro" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                <Textarea 
                  placeholder="Descrizione dettagliata del corso" 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar className="mr-2" /> Date e Orari
                </label>
                <CalendarUI 
                  mode="range" 
                  className="rounded-md border" 
                  selected={dateRange}
                  onSelect={setDateRange}
                />
              </div>
            </div>
          </div>
          
          {/* Sezione Luogo e Partecipanti */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="mr-2" /> Luogo e Partecipanti
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
                <Input 
                  placeholder="Indirizzo o sede del corso" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <User className="mr-2" /> Docenti
                </label>
                <Input 
                  placeholder="Aggiungi docenti (separati da virgola)" 
                  value={formData.teachers}
                  onChange={(e) => setFormData({...formData, teachers: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Users className="mr-2" /> Discenti Previsti
                </label>
                <Textarea 
                  placeholder="Elenco discenti (uno per riga)" 
                  rows={4}
                  value={formData.students}
                  onChange={(e) => setFormData({...formData, students: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate('/')}>Annulla</Button>
          <Button className="bg-blue-800 hover:bg-blue-900" onClick={handleSubmit}>
            Salva Evento
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewEvent;