import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useEvents } from "@/hooks/useEvents"; // Changed from useEvent to useEvents
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Event } from "@/types";
import { useState, useMemo } from "react";

const CalendarPage = () => {
  const navigate = useNavigate();
  const { events, loading } = useEvents(); // Updated to match the hook name
  const [date, setDate] = useState<Date>(new Date());

  const monthlyEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(event => {
      const eventDate = parseISO(event.start_date);
      return (
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }, [events, date]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-8">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Calendario</h1>
          </CardHeader>
          <CardContent>
            <ShadcnCalendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              locale={it}
              month={date}
              onMonthChange={setDate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              Eventi di {format(date, "MMMM yyyy", { locale: it })}
            </h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Caricamento eventi...</p>
            ) : monthlyEvents.length > 0 ? (
              <div className="space-y-4">
                {monthlyEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/evento/${event.id}`)}
                  >
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(event.start_date), "PPP", { locale: it })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nessun evento programmato per questo mese</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;