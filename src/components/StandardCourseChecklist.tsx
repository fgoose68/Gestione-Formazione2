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
  // Correzione qui: usa useState per dichiarare checkedTasks
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
          // Estrae la data YYYY-MM-DD
          dateValue = task.split(':')[1];
          // Aggiunge l'ID della checklist solo se c'è una data valida
          if (dateValue) {
             initialChecked.add(REPARTI_RISPOSTE_ID);
          }
        } else if (CHECKLIST_DEFINITIONS.some(item => item.id === task && item.type === 'checkbox')) {
          initialChecked.add(task);
        }
      }
    });
    setCheckedTasks(initialChecked);
    setRisposteRepartiDate(dateValue);
  }, [safeCompletedTasks]);

  // Funzione per ottenere i task non definiti nella checklist (per non perderli)
  const getOtherTasks = useCallback(() => {
      return safeCompletedTasks 
        .filter(task => typeof task === 'string')
        .filter(task => {
          // Filtra via tutti i task definiti nella CHECKLIST_DEFINITIONS per ricostruirli
          const isDefinedChecklistItem = CHECKLIST_DEFINITIONS.some(item => 
            item.id === task || (item.id === REPARTI_RISPOSTE_ID && task.startsWith(`${REPARTI_RISPOSTE_ID}:`))
          );
          return !isDefinedChecklistItem;
        });
  }, [safeCompletedTasks]);


  const saveChecklist = useCallback(
    debounce(async (currentChecked: Set<string>, currentDateValue: string) => {
      setIsSaving(true);
      
      const otherTasks = getOtherTasks();

      const newChecklistTasks: string[] = [];
      currentChecked.forEach(taskId => {
        if (taskId !== REPARTI_RISPOSTE_ID) {
          newChecklistTasks.push(taskId);
        }
      });

      // Gestisci REPARTI_RISPOSTE_ID specificamente
      if (currentChecked.has(REPARTI_RISPOSTE_ID) && currentDateValue) {
        // Salva la data solo se la checkbox è spuntata E la data è presente
        newChecklistTasks.push(`${REPARTI_RISPOSTE_ID}:${currentDateValue}`);
      } else if (currentChecked.has(REPARTI_RISPOSTE_ID) && !currentDateValue) {
        // Se la checkbox è spuntata ma la data è vuota, salva solo l'ID (anche se la logica di handleDateChange/handleCheckChange dovrebbe impedirlo)
        newChecklistTasks.push(REPARTI_RISPOSTE_ID);
      }

      const finalTasks = [...otherTasks, ...newChecklistTasks];

      console.log(`[StandardCourseChecklist] Saving completed_tasks:`, finalTasks);
      const result = await updateEvent(eventId, { completed_tasks: finalTasks });
      if (result) {
        showSuccess('Checklist aggiornata.');
      } else {
        showError("Errore durante l'aggiornamento della checklist.");
      }
      setIsSaving(false);
    }, 1000),
    [eventId, updateEvent, getOtherTasks] // Rimosso safeCompletedTasks, aggiunto getOtherTasks
  );

  const handleCheckChange = (taskId: string, checked: boolean) => {
    const newCheckedTasks = new Set(checkedTasks);
    let newDateValue = risposteRepartiDate;

    if (checked) {
      newCheckedTasks.add(taskId);
    } else {
      newCheckedTasks.delete(taskId);
      // Se deselezioni la checkbox della data, resetta anche il campo data
      if (taskId === REPARTI_RISPOSTE_ID) {
        setRisposteRepartiDate('');
        newDateValue = '';
      }
    }
    setCheckedTasks(newCheckedTasks);
    // Passa lo stato corrente di entrambi per il salvataggio
    saveChecklist(newCheckedTasks, newDateValue);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setRisposteRepartiDate(newDate);
    const newCheckedTasks = new Set(checkedTasks);
    
    // Se la data è impostata, la checkbox deve essere spuntata
    if (newDate) {
      newCheckedTasks.add(REPARTI_RISPOSTE_ID); 
    } else {
      // Se la data viene svuotata, deseleziona la checkbox
      newCheckedTasks.delete(REPARTI_RISPOSTE_ID); 
    }
    
    setCheckedTasks(newCheckedTasks);
    // Passa lo stato corrente di entrambi per il salvataggio
    saveChecklist(newCheckedTasks, newDate);
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