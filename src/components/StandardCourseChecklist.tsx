import { useState, useEffect, useCallback, useMemo } from 'react';
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
  { id: 'checklist_risposte_reparti_entro', label: 'Risposte dei Reparti entro il', type: 'date' },
  { id: 'checklist_avvio_corso', label: 'Avvio al corso', type: 'checkbox' },
  { id: 'checklist_redazione_vm_mod_l', label: 'Redazione V.M. e Mod "L"', type: 'checkbox' },
  { id: 'checklist_relazione_finale', label: 'Relazione finale', type: 'checkbox' },
  { id: 'checklist_altro', label: 'Altro', type: 'checkbox' },
];

const REPARTI_RISPOSTE_ID = 'checklist_risposte_reparti_entro';

export const StandardCourseChecklist = ({ eventId, completedTasks: initialCompletedTasks }: StandardCourseChecklistProps) => {
  const { updateEvent } = useEvents();
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [risposteRepartiDate, setRisposteRepartiDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Assicura che initialCompletedTasks sia sempre un array
  const safeCompletedTasks = useMemo(() => {
    if (Array.isArray(initialCompletedTasks)) {
      return initialCompletedTasks;
    }
    if (typeof initialCompletedTasks === 'string') {
      try {
        const parsed = JSON.parse(initialCompletedTasks);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.warn("Could not parse completed_tasks string as JSON array:", initialCompletedTasks, e);
      }
    }
    return [];
  }, [initialCompletedTasks]);

  useEffect(() => {
    const initialChecked = new Set<string>();
    let dateValue = '';
    safeCompletedTasks.forEach(task => {
      if (typeof task === 'string') {
        if (task.startsWith(`${REPARTI_RISPOSTE_ID}:`)) {
          dateValue = task.split(':')[1];
          initialChecked.add(REPARTI_RISPOSTE_ID);
        } else if (CHECKLIST_DEFINITIONS.some(item => item.id === task && item.type === 'checkbox')) {
          initialChecked.add(task);
        }
      }
    });
    setCheckedTasks(initialChecked);
    setRisposteRepartiDate(dateValue);
  }, [safeCompletedTasks]);

  const saveChecklist = useCallback(
    debounce(async (currentChecked: Set<string>, currentDate: string, currentSafeCompletedTasks: string[]) => {
      setIsSaving(true);
      
      // Filtra le task iniziali che non fanno parte della checklist definita
      const otherTasks = currentSafeCompletedTasks
        .filter(task => typeof task === 'string')
        .filter(task => {
          const isDefinedChecklistItem = CHECKLIST_DEFINITIONS.some(item => 
            item.id === task || (item.id === REPARTI_RISPOSTE_ID && task.startsWith(`${REPARTI_RISPOSTE_ID}:`))
          );
          return !isDefinedChecklistItem;
        });

      const newChecklistTasks: string[] = [];
      currentChecked.forEach(taskId => {
        if (taskId !== REPARTI_RISPOSTE_ID) {
          newChecklistTasks.push(taskId);
        }
      });

      if (currentChecked.has(REPARTI_RISPOSTE_ID) && currentDate) {
        newChecklistTasks.push(`${REPARTI_RISPOSTE_ID}:${currentDate}`);
      } else if (currentChecked.has(REPARTI_RISPOSTE_ID) && !currentDate) {
        // Se la checkbox è spuntata ma la data è vuota, salva solo l'ID senza data
        newChecklistTasks.push(REPARTI_RISPOSTE_ID);
      }

      const finalTasks = [...otherTasks, ...newChecklistTasks];

      const result = await updateEvent(eventId, { completed_tasks: finalTasks });
      if (result) {
        showSuccess('Checklist aggiornata.');
      } else {
        showError("Errore durante l'aggiornamento della checklist.");
      }
      setIsSaving(false);
    }, 1000),
    [eventId, updateEvent]
  );

  const handleCheckChange = (taskId: string, checked: boolean) => {
    const newCheckedTasks = new Set(checkedTasks);
    if (checked) {
      newCheckedTasks.add(taskId);
    } else {
      newCheckedTasks.delete(taskId);
      // Se deselezioni la checkbox della data, resetta anche il campo data
      if (taskId === REPARTI_RISPOSTE_ID) {
        setRisposteRepartiDate('');
      }
    }
    setCheckedTasks(newCheckedTasks);
    saveChecklist(newCheckedTasks, taskId === REPARTI_RISPOSTE_ID ? '' : risposteRepartiDate, safeCompletedTasks);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setRisposteRepartiDate(newDate);
    const newCheckedTasks = new Set(checkedTasks);
    if (newDate) {
      newCheckedTasks.add(REPARTI_RISPOSTE_ID);
    } else {
      newCheckedTasks.delete(REPARTI_RISPOSTE_ID); // Se la data viene svuotata, deseleziona la checkbox
    }
    setCheckedTasks(newCheckedTasks);
    saveChecklist(newCheckedTasks, newDate, safeCompletedTasks);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-slate-50 mb-6">
        <h4 className="font-semibold text-blue-700">Avanzamento progettualità</h4>
        {CHECKLIST_DEFINITIONS.map(item => (
            <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                    id={item.id}
                    checked={checkedTasks.has(item.id)}
                    onCheckedChange={(checked) => handleCheckChange(item.id, !!checked)}
                    disabled={isSaving}
                />
                <Label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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