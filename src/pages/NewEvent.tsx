import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react'; // Icona sostitutiva
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from 'react-day-picker';
import { useEvent } from '@/hooks/useEvent';
import { format } from 'date-fns';

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

  // ... (resto del componente rimane identico)
  
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
        {/* Esempio di uso corretto dell'icona */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" /> {/* Icona da lucide-react */}
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
          {/* ... */}
        </Popover>
        
        {/* ... (resto del JSX) */}
      </div>
    </div>
  );
};

export default NewEvent;