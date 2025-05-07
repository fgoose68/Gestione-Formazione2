import { Calendar as CalendarIconUI } from "@/components/ui/calendar"; // Rinominato per evitare conflitto
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react"; // Importa l'icona Home

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Calendario Eventi Formativi</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <CalendarIconUI
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full"
          locale={it}
          modifiers={{
            events: [
              new Date(2023, 9, 15), 
              new Date(2023, 9, 25), 
            ]
          }}
          modifiersStyles={{
            events: {
              border: '2px solid #1E40AF',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF'
            }
          }}
        />
        
        {date && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">Eventi in programma:</h3>
            <p className="text-gray-600">
              {format(date, "EEEE d MMMM yyyy", { locale: it })}
            </p>
            <ul className="mt-2 space-y-2">
              {date.getDate() === 15 && date.getMonth() === 9 && (
                <li className="text-blue-800">• Corso Sicurezza sul Lavoro (09:00-13:00)</li>
              )}
              {date.getDate() === 25 && date.getMonth() === 9 && (
                <li className="text-blue-800">• Formazione Privacy GDPR (14:00-18:00)</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;