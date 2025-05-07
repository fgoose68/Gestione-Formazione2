import { Calendar as ShadcnCalendar } from "@/components/ui/calendar"; // Rinominato per chiarezza
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { format, parseISO, getMonth, getYear, startOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Home, CalendarDays } from "lucide-react";
import { useEvents } from "@/hooks";
import { Event } from "@/types";

const CalendarPage = () => {
  const navigate = useNavigate();
  const { events, loading: eventsLoading } = useEvents();
  
  // Stato per il mese attualmente visualizzato nel calendario. Inizializza al mese corrente.
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState<Date>(startOfMonth(new Date()));
  // Stato per il giorno selezionato (opzionale, ma lo manteniamo se utile per altre funzionalità)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Filtra gli eventi per mostrare solo quelli che iniziano nel mese visualizzato
  const monthlyEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    return events
      .filter(event => {
        const eventStartDate = parseISO(event.start_date);
        return (
          getYear(eventStartDate) === getYear(currentDisplayMonth) &&
          getMonth(eventStartDate) === getMonth(currentDisplayMonth)
        );
      })
      .sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime());
  }, [events, currentDisplayMonth]);

  // Crea un array di date di inizio evento per l'evidenziazione nel calendario
  const eventStartDates = useMemo(() => {
    if (!events) return [];
    return events.map(event => parseISO(event.start_date));
  }, [events]);

  // Gestore per quando l'utente cambia il mese nel calendario
  const handleMonthChange = (month: Date) => {
    setCurrentDisplayMonth(startOfMonth(month));
  };

  if (eventsLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Caricamento eventi...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800 flex items-center">
          <CalendarDays className="mr-3 h-8 w-8" />
          Calendario Eventi
        </h1>
        <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-blue-50">
          <Home className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-xl p-6">
          <ShadcnCalendar
            mode="single" // Manteniamo la selezione singola se serve, ma il focus è sul mese
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentDisplayMonth} // Controlla il mese visualizzato
            onMonthChange={handleMonthChange} // Aggiorna quando l'utente naviga tra i mesi
            className="w-full"
            locale={it}
            modifiers={{ eventDay: eventStartDates }} // Modificatore per i giorni con eventi
            modifiersClassNames={{ eventDay: 'font-bold text-orange-600 !bg-orange-100 rounded-full' }} // Stile per i giorni con eventi
          />
        </div>

        <div className="md:col-span-1 bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4 border-b pb-2">
            Eventi di {format(currentDisplayMonth, "MMMM yyyy", { locale: it })}
          </h2>
          {monthlyEvents.length > 0 ? (
            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {monthlyEvents.map((event: Event) => (
                <li 
                  key={event.id} 
                  className="p-3 bg-slate-50 rounded-md shadow-sm hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/evento/${event.id}`)} // Opzionale: naviga al dettaglio evento
                >
                  <p className="font-medium text-blue-800">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {format(parseISO(event.start_date), "d MMM", { locale: it })}
                    {event.start_date !== event.end_date && ` - ${format(parseISO(event.end_date), "d MMM yyyy", { locale: it })}`}
                  </p>
                  {event.location && <p className="text-xs text-gray-500 mt-1">Luogo: {event.location}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nessun evento programmato per questo mese.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;