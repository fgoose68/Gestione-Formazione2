import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, BarChart2, Download } from "lucide-react";
import { useState } from "react";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { exportDepartmentAttendeesToExcel } from '@/utils/excelExport';

// Importa i nuovi componenti e hooks
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { MonthlyStatsSummary } from '@/components/stats/MonthlyStatsSummary';
import { MonthlyCourseTypeStats } from '@/components/stats/MonthlyCourseTypeStats';
import { MonthlyDepartmentRankTable } from '@/components/stats/MonthlyDepartmentRankTable';
import { EventAttendeesDetailTable } from '@/components/stats/EventAttendeesDetailTable';
import { ReportGenerator } from '@/components/stats/ReportGenerator';

const StatisticaPage = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Stato per il mese visualizzato

  const {
    events,
    loading,
    totalCoursesMonth,
    totalActualAttendeesMonth,
    statsByType,
    monthlyDepartmentRankTotals,
    monthlyDepartmentRankGrandTotals,
    attendeesByEvent,
  } = useMonthlyStats(currentMonth);

  // Funzione per gestire il download dell'Excel del Riepilogo Discenti
  // Questa funzione non è più necessaria qui, in quanto il download è gestito dal ReportGenerator
  // const handleDownloadDepartmentAttendeesExcel = () => {
  //   const monthYearString = format(currentMonth, "MMMM yyyy", { locale: it });
  //   exportDepartmentAttendeesToExcel(monthlyDepartmentRankTotals, monthlyDepartmentRankGrandTotals, monthYearString);
  // };

  // Funzioni per cambiare mese
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-blue-800 flex items-center">
          <BarChart2 className="mr-3 h-8 w-8" />
          Statistiche Eventi
        </h1>
        <div className="flex flex-col space-y-3">
          <Button onClick={() => navigate('/')} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            <Home className="mr-2 h-4 w-4" />
            Torna alla Dashboard
          </Button>
          {/* Il pulsante "Riepilogo Discenti Mensile" è stato rimosso */}
        </div>
      </div>

      {/* Navigazione Mese */}
      <div className="flex items-center justify-center mb-8 space-x-4">
         <Button variant="outline" onClick={goToPreviousMonth}>Mese Precedente</Button>
         <h2 className="text-2xl font-semibold text-blue-700">
           {format(currentMonth, "MMMM yyyy", { locale: it })}
         </h2>
         <Button variant="outline" onClick={goToNextMonth}>Mese Successivo</Button>
      </div>

      {/* Statistiche Aggregate */}
      <MonthlyStatsSummary
        totalCoursesMonth={totalCoursesMonth}
        totalActualAttendeesMonth={totalActualAttendeesMonth}
      />

      {/* Statistiche per Tipo di Corso (Mese Corrente) */}
      <MonthlyCourseTypeStats
        statsByType={statsByType}
        loading={loading}
      />

      {/* NUOVA SEZIONE: Report per Periodo Selezionato */}
      <ReportGenerator />

      {/* Riepilogo Mensile Discenti per Reparto e Grado */}
      <MonthlyDepartmentRankTable
        monthlyDepartmentRankTotals={monthlyDepartmentRankTotals}
        monthlyDepartmentRankGrandTotals={monthlyDepartmentRankGrandTotals}
        loading={loading}
      />

      {/* Dettaglio Discenti per Corso (esistente) */}
      <EventAttendeesDetailTable
        events={events}
        attendeesByEvent={attendeesByEvent}
        loading={loading}
      />
    </div>
  );
};

export default StatisticaPage;