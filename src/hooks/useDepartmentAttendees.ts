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

  const calculateExpected = (attendee: Partial<DepartmentAttendee>): number => {
    return (
      (attendee.officers || 0) +
      (attendee.inspectors || 0) +
      (attendee.superintendents || 0) +
      (attendee.militari || 0)
    );
  };

  // Questa funzione di inizializzazione non ha più bisogno dell'ID utente qui,
  // l'ID utente verrà aggiunto solo al momento del salvataggio se disponibile.
  const initializeAttendees = useCallback(() => {
    if (!eventId) return;
    const initialAttendees: DepartmentAttendee[] = DEFAULT_DEPARTMENTS.map(name => {
      const baseAttendee = {
        event_id: eventId,
        department_name: name,
        officers: 0,
        inspectors: 0,
        superintendents: 0,
        militari: 0,
        actual: 0,
        // user_id non viene inizializzato qui
      };
      return {
        ...baseAttendee,
        expected: calculateExpected(baseAttendee),
      };
    });
    setAttendees(initialAttendees);
  }, [eventId]);

  const fetchAttendees = useCallback(async () => {
    if (!eventId) {
        setAttendees([]);
        setInitialDataLoaded(true);
        return;
    }
    setLoading(true);
    try {
      // Tentiamo di ottenere l'utente, ma non blocchiamo se non c'è.
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null; // Ottieni l'ID utente se disponibile

      const { data, error } = await supabase
        .from('department_attendees')
        .select('*')
        .eq('event_id', eventId)
        // Rimosso .eq('user_id', userId) per tentare di caricare i discenti indipendentemente dall'utente loggato
        // Questo potrebbe richiedere una modifica delle policy RLS se i discenti sono legati all'utente
        ;

      if (error) throw error;

      if (data && data.length > 0) {
        const fetchedAttendeesMap = new Map(data.map(item => [item.department_name, item]));
        const combinedAttendees = DEFAULT_DEPARTMENTS.map(name => {
          const existing = fetchedAttendeesMap.get(name);
          if (existing) {
            // Assicurati che event_id e user_id siano presenti anche se non vengono usati per il fetch
            return { ...existing, event_id: eventId, user_id: existing.user_id || userId, expected: calculateExpected(existing) };
          }
          const newAttendeeBase = {
            event_id: eventId,
            department_name: name,
            officers: 0, inspectors: 0, superintendents: 0, militari: 0, actual: 0,
            user_id: userId, // Aggiungi l'ID utente se disponibile
          };
          return { ...newAttendeeBase, expected: calculateExpected(newAttendeeBase) };
        });
        setAttendees(combinedAttendees);
      } else {
        // Se non ci sono dati esistenti, inizializza con i reparti di default
        initializeAttendees();
      }
      setInitialDataLoaded(true);
    } catch (err: any) {
      // L'errore specifico "Utente non autenticato" non viene più mostrato qui
      showError(`Errore caricamento discenti per reparto: ${err.message}`);
      console.error("Errore fetchAttendees:", err);
      // In caso di errore, inizializza comunque con i reparti di default
      initializeAttendees();
      setInitialDataLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [eventId, initializeAttendees]); // initializeAttendees è memoized

  const saveAttendees = async () => {
    if (!eventId || attendees.length === 0) return;
    setLoading(true);
    try {
      // Tentiamo di ottenere l'utente, ma non blocchiamo se non c'è.
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null; // Ottieni l'ID utente se disponibile

      const upsertData = attendees.map(att => ({
        ...att, // id sarà gestito da upsert se presente
        event_id: eventId,
        user_id: userId, // Inserisce l'ID utente se disponibile, altrimenti null
        expected: calculateExpected(att), // Assicura che 'expected' sia sempre aggiornato prima del salvataggio
      }));
      
      const { error } = await supabase
        .from('department_attendees')
        .upsert(upsertData, { 
          onConflict: 'event_id,department_name,user_id', // Aggiornato onConflict
          ignoreDuplicates: false 
        });

      if (error) throw error;
      showSuccess("Dati discenti per reparto salvati con successo!");
      await fetchAttendees(); // Ricarica i dati dopo il salvataggio
    } catch (err: any) {
      // L'errore specifico "Utente non autenticato" non viene più mostrato qui
      showError(`Errore salvataggio discenti per reparto: ${err.message}`);
      console.error("Errore saveAttendees:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const updateAttendeeField = (departmentName: string, field: keyof Omit<DepartmentAttendee, 'id' | 'event_id' | 'department_name' | 'user_id' | 'expected'>, value: number) => {
    setAttendees(prev =>
      prev.map(att => {
        if (att.department_name === departmentName) {
          const updatedAtt = { ...att, [field]: Math.max(0, value) };
          // Ricalcola 'expected' ogni volta che uno dei suoi componenti cambia
          updatedAtt.expected = calculateExpected(updatedAtt);
          return updatedAtt;
        }
        return att;
      })
    );
  };


  useEffect(() => {
    if (eventId && !initialDataLoaded) {
      fetchAttendees();
    } else if (!eventId) {
        setAttendees([]);
        setInitialDataLoaded(false);
    }
  }, [eventId, fetchAttendees, initialDataLoaded]);

  return { attendees, loading, saveAttendees, fetchAttendees, updateAttendeeField, setAttendees, initialDataLoaded };
};