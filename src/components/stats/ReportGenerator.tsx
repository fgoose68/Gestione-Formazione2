import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Event, DepartmentAttendee } from '@/types';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { COURSE_TYPES_MAP } from '@/constants/courseTypes';
import { exportCourseTypeStatsToPdf, exportDepartmentAttendeesToPdf } from '@/utils/pdfExport';
import { useReportStats } from '@/hooks/useReportStats';

const ReportGenerator = () => {
  const navigate = useNavigate();
  const { reportEvents, reportLoading } = useReportStats();

  useEffect(() => {
    if (reportEvents.length > 0) {
      const dateRange = reportEvents[0].start_date;
      const endDate = reportEvents[reportEvents.length - 1].end_date;
      const monthYear = format(parseISO(dateRange), "MMMM yyyy", { locale: it });
      document.title = `Statistiche Mensili - ${monthYear}`;
    }
  }, [reportEvents]);

  const handleDownloadCourseTypeStats = () => {
    if (!reportEvents.length) return;
    const dateRangeString = `${format(reportEvents[0].start_date, "dd-MM-yyyy")} al ${format(reportEvents[reportEvents.length - 1].end_date, "dd-MM-yyyy")}`;
    exportCourseTypeStatsToPdf(reportEvents, dateRangeString);
  };

  const handleDownloadDepartmentAttendeesPdf = () => {
    if (!reportEvents.length) return;
    const dateRangeString = `${format(reportEvents[0].start_date, "dd-MM-yyyy")} al ${format(reportEvents[reportEvents.length - 1].end_date, "dd-MM-yyyy")}`;
    exportDepartmentAttendeesToPdf(reportEvents, dateRangeString);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Statistiche Mensili</h1>
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
              {reportEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 mb-2 bg-white hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-2">Tipo: {event.type}</p>
                  <p className="text-gray-600 mb-2">Data: {format(parseISO(event.start_date), "dd/MM/yyyy", { locale: it })}</p>
                  <p className="text-gray-600 mb-2">Luogo: {event.location || 'N/D'}</p>
                  <p className="text-gray-600 mb-2">Descrizione: {event.description || 'N/D'}</p>
                  <div className="mt-4">
                    <Button onClick={() => handleDownloadCourseTypeStatsPdf()} className="bg-green-600 hover:bg-green-700 text-white">
                      <Download className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                    <Button onClick={() => handleDownloadDepartmentAttendeesPdf()} className="ml-2 bg-red-600 hover:bg-red-700 text-white">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-6">
              <h2 className="text-2xl font-semibold text-blue-800">Riepilogo Discenti per Reparto e Grado</h2>
              <p className="text-gray-600 mb-4">Dati aggiornati al {format(new Date(), "dd/MM/yyyy", { locale: it })}</p>
              <div className="space-y-4">
                {reportEvents.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold mb-2">Totale Eventi:</h3>
                    <p className="text-gray-600">{reportEvents.length}</p>
                  </div>
                ) : (
                  <p className="text-center text-gray-600">Nessun evento trovato.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;