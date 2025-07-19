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

const CHECKLIST_ITEMS = [
  { id: 'checklist_circolare_indizione', label: 'Circolare indizione' },
  { id: 'checklist_avvio_corso', label: 'Avvio al corso' },
  { id: 'checklist_redazione_vm_mod_l', label: 'Redazione V.M. e Mod "L"' },
  { id: 'checklist_relazione_finale', label: 'Relazione finale' },
  { id: 'checklist_altro', label: 'Altro' },
];

const REPARTI_RISPOSTE_ID = 'checklist_risposte_reparti_entro';

export const StandardCourseChecklist = ({ eventId, completedTasks: initialCompletedTasks }: StandardCourseChecklistProps) => {
  const { updateEvent } = useEvents();
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [risposteRepartiDate, setRisposteRepartiDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialChecked = new Set<string>();
    let dateValue = '';
    (initialCompletedTasks || []).forEach(task => {
      if (task.startsWith(`${REPARTI_RISPOSTE_ID}:`)) {
        dateValue = task.split(':')[1];
        initialChecked.add(REPARTI_RISPOSTE_ID);
      } else {
        const isChecklistItem = CHECKLIST_ITEMS.some(item => item.id === task);
        if (isChecklistItem || task === REPARTI_RISPOSTE_ID) {
            initialChecked.add(task);
        }
      }
    });
    setCheckedTasks(initialChecked);
    setRisposteRepartiDate(dateValue);
  }, [initialCompletedTasks]);

  const saveChecklist = useCallback(
    debounce(async (currentChecked: Set<string>, currentDate: string) => {
      setIsSaving(true);
      const otherTasks = (initialCompletedTasks || []).filter(task => {
        const isStandardChecklistItem = CHECKLIST_ITEMS.some(item => item.id === task);
        const isRisposteRepartiTask = task.startsWith(REPARTI_RISPOSTE_ID) || task === REPARTI_RISPOSTE_ID;
        return !isStandardChecklistItem && !isRisposteRepartiTask;
      });

      const newChecklistTasks: string[] = [];
      currentChecked.forEach(task => {
        if (task !== REPARTI_RISPOSTE_ID) {
          newChecklistTasks.push(task);
        }
      });

      if (currentDate && currentChecked.has(REPARTI_RISPOSTE_ID)) {
        newChecklistTasks.push(`${REPARTI_RISPOSTE_ID}:${currentDate}`);
      } else if (currentChecked.has(REPARTI_RISPOSTE_ID)) {
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
    [eventId, initialCompletedTasks, updateEvent]
  );

  const handleCheckChange = (taskId: string, checked: boolean) => {
    const newCheckedTasks = new Set(checkedTasks);
    if (checked) {
      newCheckedTasks.add(taskId);
    } else {
      newCheckedTasks.delete(taskId);
    }
    setCheckedTasks(newCheckedTasks);
    saveChecklist(newCheckedTasks, risposteRepartiDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setRisposteRepartiDate(newDate);
    const newCheckedTasks = new Set(checkedTasks);
    if (newDate) {
      newCheckedTasks.add(REPARTI_RISPOSTE_ID);
    }
    setCheckedTasks(newCheckedTasks);
    saveChecklist(newCheckedTasks, newDate);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-slate-50 mb-6">
        <h4 className="font-semibold text-blue-700">Checklist Corso Standard</h4>
        {CHECKLIST_ITEMS.map(item => (
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
            </div>
        ))}
        <div className="flex items-center space-x-2">
            <Checkbox
                id={REPARTI_RISPOSTE_ID}
                checked={checkedTasks.has(REPARTI_RISPOSTE_ID)}
                onCheckedChange={(checked) => handleCheckChange(REPARTI_RISPOSTE_ID, !!checked)}
                disabled={isSaving}
            />
            <Label htmlFor={REPARTI_RISPOSTE_ID} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Risposte dei Reparti entro il
            </Label>
            <Input
                type="date"
                value={risposteRepartiDate}
                onChange={handleDateChange}
                className="w-40 h-8"
                disabled={isSaving}
            />
        </div>
    </div>
  );
};