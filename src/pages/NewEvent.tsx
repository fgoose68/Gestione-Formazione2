import { Calendar, MapPin, User, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarUI } from '@/components/ui/calendar';

const NewEvent = () => {
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
                <Input placeholder="Es: Sicurezza sul Lavoro" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                <Textarea placeholder="Descrizione dettagliata del corso" rows={3} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar className="mr-2" /> Date e Orari
                </label>
                <CalendarUI mode="range" className="rounded-md border" />
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
                <Input placeholder="Indirizzo o sede del corso" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <User className="mr-2" /> Docenti
                </label>
                <Input placeholder="Aggiungi docenti (separati da virgola)" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Users className="mr-2" /> Discenti Previsti
                </label>
                <Textarea placeholder="Elenco discenti (uno per riga)" rows={4} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <Button variant="outline">Annulla</Button>
          <Button className="bg-blue-800 hover:bg-blue-900">Salva Evento</Button>
        </div>
      </div>
    </div>
  );
};

export default NewEvent;