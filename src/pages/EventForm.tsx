import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const EventForm = () => {
  const { register, handleSubmit, watch, setValue } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Qui andrà la logica per salvare l'evento
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Nuovo Evento Formativo</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titolo del Corso</label>
          <Input {...register('title')} placeholder="Es. Corso sulla Sicurezza sul Lavoro" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('startDate') ? format(watch('startDate'), 'PPP', { locale: it }) : <span>Seleziona data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch('startDate')}
                  onSelect={(date) => setValue('startDate', date)}
                  initialFocus
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('endDate') ? format(watch('endDate'), 'PPP', { locale: it }) : <span>Seleziona data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch('endDate')}
                  onSelect={(date) => setValue('endDate', date)}
                  initialFocus
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
          <Input {...register('location')} placeholder="Es. Sala Riunioni, Piano 3" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Docenti</label>
          <Textarea {...register('teachers')} placeholder="Inserisci i nomi dei docenti, separati da virgola" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discenti Previsti</label>
          <Textarea {...register('students')} placeholder="Inserisci i nomi dei discenti, uno per riga" />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-800 hover:bg-blue-900">
            Salva Evento
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;