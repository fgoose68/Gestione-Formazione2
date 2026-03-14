import { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEvents } from '@/hooks';
import { showError, showSuccess } from '@/utils/toast';
import { debounce } from 'lodash';

interface StandardCourseChecklistProps {
  eventId: string;
  completedTasks: string[];
}

// Definizione di tutti gli elementi della checklist, inclusa la data, nell'ordine desiderato
const CHECKLIST_DEFINITIONS = [
  { id: 'checklist_circolare_indizione', label: 'Circolare indizione', type: 'checkbox' },
  { id: 'checklist_pubblicazione', label: 'Pubblicazione', type: 'checkbox' }, // Aggiunto dopo Circolare indizione
  { id: 'checklist_risposte_reparti_entro', label: 'Risposte dei Reparti', type: 'date' },
  { id: 'checklist_avvio_corso', label: 'Avvio al corso', type: 'checkbox' },
  { id: 'checklist_redazione_vm_mod_l', label: 'Redazione V.M. e Mod "L"', type: 'checkbox' },
  { id: 'checklist_relazione_finale', label: 'Relazione finale', type: 'checkbox' },
  { id: 'checklist_altro', label: 'Altro', type: 'checkbox' },
];

const REPARTI_RISPOSTE_ID = 'checklist_risposte_reparti_entro';

export const StandardCourseChecklist = ({ eventId, completedTasks: initialCompletedTasks }: StandardCourseChecklistProps) => {
  const { updateEvent } = useEvents();

  // Stato per i task selezionati
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

  // Stato per la data delle risposte dei reparti
  const [risposteRepartiDate, setRisposteRepartiDate] = useState('');

  // Stato per il salvataggio in corso
  const [isSaving, setIsSaving] = useState(false);

  // Inizializza i task selezionati in base ai dati ricevuti
  useEffect(() => {
    const initialChecked = new Set<string>();
    let dateValue = '';

    // Proteggiamo initialCompletedTasks: se non è un array, usiamo un array vuoto
    const tasks = Array.isArray(initialCompletedTasks) ? initialCompletedTasks : [];

    tasks.forEach(task => {
      if (typeof task === 'string') {
        if (task.startsWith(`${REPARTI_RISPOSTE_ID}:`)) {
          const datePart = task.split(':')[1];
          if (datePart) {
            initialChecked.add(REPARTI_RISPOSTE_ID);
            dateValue = datePart;
          }
        } else if (CHECKLIST_DEFINITIONS.some(item => item.id === task)) {
          initialChecked.add(task);
        }
      }
    });

    setCheckedTasks(initialChecked);
    setRisposteRepartiDate(dateValue);
  }, [initialCompletedTasks]);

  // Funzione per gestire il cambiamento della data
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setRisposteRepartiDate(newDate);
    const newCheckedTasks = new Set(checkedTasks);
    if (newDate) {
      newCheckedTasks.add(REPARTI_RISPOSTE_ID);
    } else {
      newCheckedTasks.delete(REPARTI_RISPOSTE_ID);
    }
    setCheckedTasks(newCheckedTasks);
    saveChecklist(newCheckedTasks, newDate);
  };

  // Funzione per aggiornare i task selezionati
  const handleCheckChange = (taskId: string, checked: boolean) => {
    const newCheckedTasks = new Set(checkedTasks);
    let newDateValue = risposteRepartiDate;

    if (checked) {
      newCheckedTasks.add(taskId);
    } else {
      newCheckedTasks.delete(taskId);
      if (taskId === REPARTI_RISPOSTE_ID) {
        setRisposteRepartiDate('');
        newDateValue = '';
      }
    }

    setCheckedTasks(newCheckedTasks);
    saveChecklist(newCheckedTasks, newDateValue);
  };

  // Funzione per salvare i dati
  const saveChecklist = useCallback(
    debounce(async (currentChecked: Set<string>, currentDateValue: string) => {
      setIsSaving(true);
      const otherTasks = Array.from(currentChecked).filter(taskId => taskId !== REPARTI_RISPOSTE_ID);
      const newChecklistTasks: string[] = [...otherTasks];

      if (currentChecked.has(REPARTI_RISPOSTE_ID) && currentDateValue) {
        newChecklistTasks.push(`${REPARTI_RISPOSTE_ID}:${currentDateValue}`);
      } else if (currentChecked.has(REPARTI_RISPOSTE_ID) && !currentDateValue) {
        newChecklistTasks.push(REPARTI_RISPOSTE_ID);
      }

      const result = await updateEvent(eventId, { completed_tasks: newChecklistTasks });
      if (result) {
        showSuccess('Checklist aggiornata.');
      } else {
        showError("Errore durante l'aggiornamento della checklist.");
      }
      setIsSaving(false);
    }, 1000),
    [eventId, updateEvent]
  );

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-slate-50 mb-6">
      <h4 className="font-semibold text-blue-700">Avanzamento progettualità</h4>
      {CHECKLIST_DEFINITIONS.map(item => (
        <div key={item.id} className="flex items-center space-x-2">
          <Checkbox
            id={item.id}
            checked={checkedTasks.has(item.id)}
            onCheckedChange={(checked) => handleCheckChange(item.id, checked)}
            disabled={isSaving}
          />
          <Label
            htmlFor={item.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {item.label}
          </Label>
          {item.type === 'date' && (
            <Input
              type="date"
              value={risposteRepartiDate}
              onChange={handleDateChange}
              className="w-40 h-8"
              disabled={isSaving}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StandardCourseChecklist;