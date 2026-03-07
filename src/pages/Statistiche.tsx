import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { useReportStats } from '@/hooks/useReportStats';
import { CourseTypeStats } from '@/types';
import { exportCourseTypeStatsToPdf, exportDepartmentAttendeesToPdf } from '@/utils/pdfExport';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';

const Statistiche = () => {
  const navigate = useNavigate();
  const { events, loading: eventsLoading } = useEvents();
  const { reportEvents, reportLoading, reportStatsByType, reportDepartmentRankTotals, reportDepartmentRankGrandTotals } = useReportStats();
  const [reportDateRange, setReportDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (reportEvents.length > 0) {
      const dateRange = {
        from: reportEvents[0].start_date,
        to: reportEvents[reportEvents.length - 1].end_date,
      };
      setReportDateRange(dateRange);
    }
  }, [reportEvents]);

  const handleDownloadCourseTypeStatsExcel = () => {
    if (!reportDateRange?.from || !reportDateRange?.to) return;
    exportCourseTypeStatsToExcel(reportStatsByType, format(reportDateRange.from, "dd-MM-yyyy"), format(reportDateRange.to, "dd-MM-yyyy"));
  };

  const handleDownloadDepartmentAttendeesPdf = () => {
    if (!reportDateRange?.from || !reportDateRange?.to) return;
    exportDepartmentAttendeesToPdf(reportDepartmentRankTotals, reportDepartmentRankGrandTotals, format(reportDateRange.from, "dd-MM-yyyy"), format(reportDateRange.to, "dd-MM-yyyy"));
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Statistiche</h1>
        <div className="flex space-x-3">
          <Button onClick={() => navigate('/')} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            <Home className="mr-2 h-4 w-4" />
            Torna alla Dashboard
          </Button>
          <Button onClick={() => navigate('/scadenze')} variant="outline" className="bg-gray-300 hover:bg-gray-400 text-gray-800">
            <CalendarDays className="mr-2 h-4 w-4" />
            Scadenze
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-700 text-white p-6">
            <h2 className="text-2xl font-semibold">Statistiche per Tipo di Corso</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Report Corsi per Tipo</h3>
              <p className="text-gray-600">Seleziona un intervallo di date per generare il report.</p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => handleDownloadCourseTypeStatsExcel()} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button onClick={() => handleDownloadCourseTypeStatsPdf()} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="shadow-lg rounded-lg">
          <div className="p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold text-blue-800">Riepilogo Discenti per Reparto e Grado</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Statistiche per Reparto</h3>
              <div className="space-y-2">
                <p className="text-gray-600">Seleziona un intervallo di date per generare il report.</p>
                <Button onClick={() => handleDownloadDepartmentAttendeesExcel()} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900">
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button onClick={() => handleDownloadDepartmentAttendeesPdf()} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900">
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistiche;