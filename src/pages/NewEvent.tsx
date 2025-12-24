import { Calendar as CalendarIcon, MapPin, User, Users, FileText, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar'; // Shadcn Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Importa i componenti Select
import { Checkbox } from '@/components/ui/checkbox'; // Importa Checkbox
import { Label } from '@/components/ui/label'; // Importa Label
import { useState, useMemo, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { showError, showSuccess } from '@/utils/toast';
import { DepartmentAttendee, Event } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_DEPARTMENTS } from '@/constants/departments';
import { COURSE_TYPES } from '@/constants/courseTypes';
import { SSL_COURSE_DEFINITIONS, SSL_COURSE_CODES } from '@/constants/sslCourses'; // Importa le nuove costanti SSL

// Opzioni per il menu a tendina Luogo
const LOCATIONS = [
  "Roma",
  "RI",
  "VT",
  "FR",
  "ROAN",
  "LT",
  "Formia",
  "Scuola PEF",
  "Scuola Nautica",
  "Altre sedi"
];


const NewEvent = () => {
  const { addEvent } = useEvents();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Stato per i dati del form
  const [formData, setFormData] = useState({
    title: '', // Titolo descrittivo (usato solo se isSslCourse è false)
    description: '',
    teachersRaw: '',
    // Campi per la standardizzazione SSL
    isSslCourse: false,
    sslYear: new Date().getFullYear().toString(),
    sslCourseCode: SSL_COURSE_CODES[0] || '',
    sslSessionNumber: '01',
  });

  // Stato per il tipo di corso selezionato
  const [courseType, setCourseType] = useState<Event['type'] | undefined>(undefined);
  // Stato per il luogo selezionato (ora dal menu a tendina)
  const [location, setLocation] = useState<string | undefined>(undefined);


  const [loading, setLoading] = useState(false);

  const [departmentAttendeesInput, setDepartmentAttendeesInput] = useState<Omit<DepartmentAttendee, 'id' | 'event_id' | 'user_id'>[]>([]);

  useEffect(() => {
    const initialAttendees: Omit<DepartmentAttendee, 'id' | 'event_id' | 'user_id'>[] = DEFAULT_DEPARTMENTS.map(name => ({
      department_name: name,
      officers: 0,
      inspectors: 0,
      superintendents: 0,
      militari: 0,
      actual: 0,
      expected: 0,
    }));
    setDepartmentAttendeesInput(initialAttendees);
  }, []);


  const calculateExpected = (attendee: Partial<Omit<DepartmentAttendee, 'id' | 'event_id' | 'user_id'>>): number => {
    return (
      (attendee.officers || 0) +
      (attendee.inspectors || 0) +
      (attendee.superintendents || 0) +
      (attendee.militari || 0)
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSslCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isSslCourse: checked }));
  };

  const handleDepartmentAttendeeInputChange = (departmentName: string, field: keyof Omit<DepartmentAttendee, 'id' | 'event_id' | 'user_id' | 'expected'>, value: string) => {
     setDepartmentAttendeesInput(prev =>
      prev.map(att => {
        if (att.department_name === departmentName) {
          const numericValue = parseInt(value, 10);
          const updatedAtt = { ...att, [field]: isNaN(numericValue) || numericValue < 0 ? 0 : numericValue };
          updatedAtt.expected = calculateExpected(updatedAtt);
          return updatedAtt;
        }
        return att;
      })
    );
  };

  const totals = useMemo(() => {
    return departmentAttendeesInput.reduce(
      (acc, curr) => {
        acc.officers += curr.officers || 0;
        acc.inspectors += curr.inspectors || 0;
        acc.superintendents += curr.superintendents || 0;
        acc.militari += curr.militari || 0;
        acc.expected += curr.expected || 0;
        acc.actual += curr.actual || 0;
        return acc;
      },
      { officers: 0, inspectors: 0, superintendents: 0, militari: 0, expected: 0, actual: 0 }
    );
  }, [departmentAttendeesInput]);
  
  // Calcola il titolo finale in base alla modalità (SSL o standard)
  const finalEventTitle = useMemo(() => {
    if (formData.isSslCourse) {
      const courseDef = SSL_COURSE_DEFINITIONS.find(d => d.code === formData.sslCourseCode);
      const descriptiveTitle = courseDef ? courseDef.title : 'Corso Sconosciuto';
      const sessionNumber = formData.sslSessionNumber.padStart(2, '0');
      
      return `${formData.sslYear} - ${formData.sslCourseCode} - Ed. ${sessionNumber} - ${descriptiveTitle}`;
    }
    return formData.title;
  }, [formData.isSslCourse, formData.sslYear, formData.sslCourseCode, formData.sslSessionNumber, formData.title]);


  const handleSubmit = async () => {
    if (!finalEventTitle) {
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
    // Validazione per il luogo: non richiesto se il tipo è 'E-learning' o 'Didattica a distanza (DAD)'
    if (courseType !== 'E-learning' && courseType !== 'Didattica a distanza (DAD)' && !location) {
       showError('Seleziona il luogo del corso.');
       return;
    }


    setLoading(true);

    const newEventData = {
      title: finalEventTitle, // Usa il titolo generato
      description: formData.description,
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      // Se il tipo è E-learning o Didattica a distanza (DAD), salva la location come stringa vuota, altrimenti usa il valore selezionato
      location: (courseType === 'E-learning' || courseType === 'Didattica a distanza (DAD)') ? '' : location || '',
      teachers: formData.teachersRaw.split(',').map(t => t.trim()).filter(t => t),
      type: courseType, // Includi il tipo di corso
    };

    try {
      const eventResult = await addEvent(newEventData);

      if (eventResult && eventResult.id) {
        const newEventId = eventResult.id;

        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;

        const attendeesToSave = departmentAttendeesInput.map(att => ({
          ...att,
          event_id: newEventId,
          user_id: userId,
          expected: calculateExpected(att),
        }));

        const { error: attendeesError } = await supabase
          .from('department_attendees')
          .insert(attendeesToSave);

        if (attendeesError) {
           console.error("Errore salvataggio discenti per reparto:", attendeesError);
           showError(`Evento creato, ma errore nel salvataggio discenti: ${attendeesError.message}`);
        } else {
           showSuccess('Evento e discenti salvati con successo!');
        }

        navigate('/');

      } else {
         if (!loading) {
            showError('Errore nella creazione dell\'evento.');
         }
      }
    } catch (err: any) {
       console.error("Errore generale nel submit:", err);
       showError(`Si è verificato un errore: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 border-b pb-4">Crea Nuovo Evento Formativo</h1>

        <div className="space-y-6">
          
          {/* Checkbox per la standardizzazione SSL */}
          <div className="flex items-center space-x-2 p-4 border rounded-md bg-blue-50">
            <Checkbox 
              id="ssl-course-checkbox" 
              checked={formData.isSslCourse} 
              onCheckedChange={handleSslCheckboxChange}
              disabled={loading}
            />
            <Label htmlFor="ssl-course-checkbox" className="text-base font-semibold text-blue-800">
              Applica standardizzazione per Corsi Sicurezza sul Lavoro (SSL)
            </Label>
          </div>

          {/* Campi per la standardizzazione SSL (mostrati se la checkbox è spuntata) */}
          {formData.isSslCourse ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-yellow-50">
              {/* Anno Formativo */}
              <div>
                <label htmlFor="sslYear" className="block text-sm font-medium text-gray-700 mb-1">Anno Formativo</label>
                <Input 
                  id="sslYear" 
                  name="sslYear" 
                  type="number"
                  placeholder="Es. 2025" 
                  value={formData.sslYear} 
                  onChange={handleInputChange} 
                  disabled={loading}
                />
              </div>
              
              {/* Codice Corso Base */}
              <div>
                <label htmlFor="sslCourseCode" className="block text-sm font-medium text-gray-700 mb-1">Codice Corso Base (SSL)</label>
                <Select 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sslCourseCode: value }))} 
                  value={formData.sslCourseCode} 
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona Codice" />
                  </SelectTrigger>
                  <SelectContent>
                    {SSL_COURSE_DEFINITIONS.map(def => (
                      <SelectItem key={def.code} value={def.code}>
                        {def.code} - {def.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Numero Sessione */}
              <div>
                <label htmlFor="sslSessionNumber" className="block text-sm font-medium text-gray-700 mb-1">Numero Sessione (Es. 01)</label>
                <Input 
                  id="sslSessionNumber" 
                  name="sslSessionNumber" 
                  type="number"
                  min="1"
                  placeholder="Es. 01" 
                  value={formData.sslSessionNumber} 
                  onChange={handleInputChange} 
                  disabled={loading}
                />
              </div>
              
              {/* Anteprima Titolo */}
              <div className="md:col-span-3 mt-2">
                <p className="text-sm font-medium text-gray-700">Nome Completo Evento (Anteprima):</p>
                <p className="text-lg font-bold text-green-700 break-words">{finalEventTitle}</p>
              </div>
            </div>
          ) : (
            /* Campo Titolo Standard (mostrato se la checkbox NON è spuntata) */
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titolo del Corso</label>
              <Input id="title" name="title" placeholder="Es: Sicurezza sul Lavoro Avanzato" value={formData.title} onChange={handleInputChange} className="text-lg" disabled={loading}/>
            </div>
          )}


          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <Textarea id="description" name="description" placeholder="Dettagli del corso, obiettivi, argomenti trattati..." value={formData.description} onChange={handleInputChange} rows={4} disabled={loading}/>
          </div>

           {/* Campo Selezione Tipo Corso */}
          <div>
            <label htmlFor="courseType" className="block text-sm font-medium text-gray-700 mb-1">Tipo di Corso</label>
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
            {/* Modificato il testo dell'etichetta */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
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

          {/* Campo Selezione Luogo */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Luogo {(courseType === 'E-learning' || courseType === 'Didattica a distanza (DAD)') ? '(Non applicabile)' : ''}</label>
            <Select onValueChange={setLocation} value={location} disabled={loading || courseType === 'E-learning' || courseType === 'Didattica a distanza (DAD)'}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona il luogo" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             {(courseType === 'E-learning' || courseType === 'Didattica a distanza (DAD)') && (
                <p className="mt-1 text-sm text-gray-500">Il luogo non è richiesto per i corsi E-learning o Didattica a distanza (DAD).</p>
             )}
          </div>

          <div>
            <label htmlFor="teachersRaw" className="block text-sm font-medium text-gray-700 mb-1">Docenti</label>
            <Input id="teachersRaw" name="teachersRaw" placeholder="Mario Rossi, Luigi Verdi (separati da virgola)" value={formData.teachersRaw} onChange={handleInputChange} disabled={loading}/>
          </div>

          {/* Tabella Discenti per Reparto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Discenti per Reparto</h3>
             <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Reparto</TableHead>
                    <TableHead className="text-center font-semibold">Uff.</TableHead>
                    <TableHead className="text-center font-semibold">Isp.</TableHead>
                    <TableHead className="text-center font-semibold">Sovr.</TableHead>
                    <TableHead className="text-center font-semibold">Mil./App.</TableHead>
                    <TableHead className="text-center font-semibold bg-blue-50">Previsti</TableHead>
                    <TableHead className="text-center font-semibold">Effettivi</TableHead>
                    {/* Assenti non inseribili in creazione, solo visualizzabili */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentAttendeesInput.map((att) => (
                    <TableRow key={att.department_name}>
                      <TableCell className="font-medium">{att.department_name}</TableCell>
                      {(['officers', 'inspectors', 'superintendents', 'militari'] as const).map(field => (
                        <TableCell key={field} className="text-center">
                          <Input
                            type="number"
                            min="0"
                            value={att[field] || 0}
                            onChange={(e) => handleDepartmentAttendeeInputChange(att.department_name, field, e.target.value)}
                            className="w-20 text-center mx-auto"
                            disabled={loading}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-medium bg-blue-50">{att.expected || 0}</TableCell>
                      <TableCell className="text-center">
                         <Input
                            type="number"
                            min="0"
                            value={att.actual || 0}
                            onChange={(e) => handleDepartmentAttendeeInputChange(att.department_name, 'actual', e.target.value)}
                            className="w-20 text-center mx-auto"
                            disabled={loading}
                          />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                 <TableFooter>
                      <TableRow className="bg-slate-200">
                        <TableHead className="font-bold text-slate-800">TOTALE</TableHead>
                        <TableCell className="text-center font-bold text-slate-800">{totals.officers}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800">{totals.inspectors}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800">{totals.superintendents}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800">{totals.militari}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800 bg-blue-100">{totals.expected}</TableCell>
                        <TableCell className="text-center font-bold text-slate-800">{totals.actual}</TableCell>
                         <TableCell className="text-center font-bold text-slate-800 bg-red-100">
                           {/* Calcola assenti totali qui per la visualizzazione */}
                           {Math.max(0, totals.expected - totals.actual)}
                         </TableCell>
                      </TableRow>
                    </TableFooter>
              </Table>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => navigate('/')} disabled={loading}>
            Annulla
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Evento'}
             <Save className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewEvent;