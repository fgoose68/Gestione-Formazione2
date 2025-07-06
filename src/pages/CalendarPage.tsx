import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useEvents } from "@/hooks/useEvents";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Event } from "@/types";
import { useMemo, useState } from "react";

const CalendarPage = () => {
  const navigate = useNavigate();
  const { events, loading } = useEvents();
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
      <div className="flex flex-col items-center">
        <Button 
          onClick={() => navigate('/')}
          className="mb-6 bg-yellow-400 hover:bg-yellow-500 text-black"
        >
          Torna alla Dashboard
        </Button>
        
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl">
                Calendario Eventi
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ShadCalendar
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

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-center">
                Eventi di {format(date, "MMMM yyyy", { locale: it })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center">Caricamento eventi...</p>
              ) : monthlyEvents.length > 0 ? (
                <div className="space-y-4">
                  {monthlyEvents.map((event, index) => (
                    <div 
                      key={event.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors 
                        ${index % 2 === 0 ? 'bg-yellow-50 hover:bg-yellow-100' : 'bg-green-50 hover:bg-green-100'}`}
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
                <p className="text-center">Nessun evento programmato per questo mese</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;