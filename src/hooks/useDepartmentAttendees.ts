import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DepartmentAttendee } from '@/types';
import { showError, showSuccess } from '@/utils/toast';

const DEFAULT_DEPARTMENTS = [
  "Comando Regionale",
  "Provinciale Roma",
  "Provinciale Latina",
  "Provinciale Frosinone",
  "Provinciale Rieti",
  "Provinciale Viterbo",
  "ROAN",
  "ReTLA Lazio",
  "CAR", // Centro Addestramento Regionale
  "Altri Reparti"
];

export const useDepartmentAttendees = (eventId: string | undefined) => {
  const [attendees, setAttendees] = useState<DepartmentAttendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const initializeAttendees = useCallback(async (currentUserId: string) => {
    if (!eventId) return;
    const initialAttendees: DepartmentAttendee[] = DEFAULT_DEPARTMENTS.map(name => ({
      event_id: eventId,
      department_name: name,
      officers: 0,
      inspectors: 0,
      superintendents: 0,
      militari: 0,
      expected: 0,
      actual: 0,
      user_id: currentUserId,
    }));
    setAttendees(initialAttendees);
  }, [eventId]);

  const fetchAttendees = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAttendees([]);
        setInitialDataLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from('department_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        // Mappa i dati esistenti e assicurati che tutti i reparti di default siano presenti
        const fetchedAttendeesMap = new Map(data.map(item => [item.department_name, item]));
        const combinedAttendees = DEFAULT_DEPARTMENTS.map(name => {
          const existing = fetchedAttendeesMap.get(name);
          return existing ? { ...existing, event_id: eventId, user_id: user.id } : {
            event_id: eventId,
            department_name: name,
            officers: 0,
            inspectors: 0,
            superintendents: 0,
            militari: 0,
            expected: 0,
            actual: 0,
            user_id: user.id,
          };
        });
        setAttendees(combinedAttendees);
      } else {
        // Se non ci sono dati, inizializza con i default
        await initializeAttendees(user.id);
      }
      setInitialDataLoaded(true);
    } catch (err: any) {
      showError(`Errore caricamento discenti per reparto: ${err.message}`);
      console.error("Errore fetchAttendees:", err);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await initializeAttendees(user.id); // Fallback all'inizializzazione
      setInitialDataLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [eventId, initializeAttendees]);

  const saveAttendees = async () => {
    if (!eventId || attendees.length === 0) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("Utente non autenticato per salvare i discenti.");
        return;
      }

      // Prepara i dati per l'upsert, assicurandoti che user_id sia presente
      const upsertData = attendees.map(att => ({
        ...att,
        event_id: eventId, // Assicura che event_id sia corretto
        user_id: user.id,  // Assicura che user_id sia corretto
      }));
      
      console.log("Dati inviati per upsert:", upsertData);

      const { error } = await supabase
        .from('department_attendees')
        .upsert(upsertData, { onConflict: 'event_id, department_name', ignoreDuplicates: false });

      if (error) {
        console.error("Errore Supabase durante upsert:", error);
        throw error;
      }
      showSuccess("Dati discenti per reparto salvati con successo!");
      await fetchAttendees(); // Ricarica per avere ID e dati aggiornati
    } catch (err: any) {
      showError(`Errore salvataggio discenti per reparto: ${err.message}`);
      console.error("Errore saveAttendees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId && !initialDataLoaded) {
      fetchAttendees();
    }
  }, [eventId, fetchAttendees, initialDataLoaded]);

  const updateAttendeeField = (departmentName: string, field: keyof DepartmentAttendee, value: number) => {
    setAttendees(prev =>
      prev.map(att =>
        att.department_name === departmentName ? { ...att, [field]: Math.max(0, value) } : att // Assicura che il valore non sia negativo
      )
    );
  };

  return { attendees, loading, saveAttendees, fetchAttendees, updateAttendeeField, setAttendees, initialDataLoaded };
};