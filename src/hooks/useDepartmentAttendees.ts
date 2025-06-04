import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DepartmentAttendee } from '@/types';
import { showError, showSuccess } from '@/utils/toast';
import { DEFAULT_DEPARTMENTS } from '@/constants/departments'; // Importa la costante

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

  const initializeAttendees = useCallback(async (currentUserId: string) => {
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
        user_id: currentUserId,
      };
      return {
        ...baseAttendee,
        expected: calculateExpected(baseAttendee),
      };
    });
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
        setLoading(false); // Assicura che loading sia false anche senza utente
        return;
      }

      const { data, error } = await supabase
        .from('department_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const fetchedAttendeesMap = new Map(data.map(item => [item.department_name, item]));
        const combinedAttendees = DEFAULT_DEPARTMENTS.map(name => {
          const existing = fetchedAttendeesMap.get(name);
          if (existing) {
            // Assicurati che 'expected' sia ricalcolato anche per i dati esistenti
            return { ...existing, event_id: eventId, user_id: user.id, expected: calculateExpected(existing) };
          }
          const newAttendeeBase = {
            event_id: eventId,
            department_name: name,
            officers: 0, inspectors: 0, superintendents: 0, militari: 0, actual: 0,
            user_id: user.id,
          };
          return { ...newAttendeeBase, expected: calculateExpected(newAttendeeBase) };
        });
        setAttendees(combinedAttendees);
      } else {
        await initializeAttendees(user.id);
      }
      setInitialDataLoaded(true);
    } catch (err: any) {
      showError(`Errore caricamento discenti per reparto: ${err.message}`);
      console.error("Errore fetchAttendees:", err);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await initializeAttendees(user.id);
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

      const upsertData = attendees.map(att => {
        // Escludi 'absent' e 'id' se non presente (per nuovi record)
        const { absent, id, ...dataToSave } = att;
        return {
          ...dataToSave,
          event_id: eventId,
          user_id: user.id,
          expected: calculateExpected(att), // Assicura che 'expected' sia sempre aggiornato
          ...(id && { id }), // Includi l'ID solo se esiste (per aggiornamenti)
        };
      });
      
      console.log("Dati inviati per upsert (escluso absent):", upsertData);

      const { error } = await supabase
        .from('department_attendees')
        .upsert(upsertData, { 
          onConflict: 'event_id,department_name,user_id', 
          ignoreDuplicates: false 
        });

      if (error) throw error;
      showSuccess("Dati discenti per reparto salvati con successo!");
      await fetchAttendees(); // Ricarica per avere ID e dati aggiornati
    } catch (err: any) {
      showError(`Errore salvataggio discenti per reparto: ${err.message}`);
      console.error("Errore saveAttendees:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Aggiorna il tipo per 'field' per escludere 'expected' e 'absent'
  const updateAttendeeField = (departmentName: string, field: 'officers' | 'inspectors' | 'superintendents' | 'militari' | 'actual', value: number) => {
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