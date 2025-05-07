import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { DateRange } from "react-day-picker";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Calendario Eventi</h1>
      
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4">Calendario</h2>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4">Intervallo Date</h2>
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              className="rounded-md border"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarPage;