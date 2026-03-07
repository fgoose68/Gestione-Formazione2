import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, CalendarDays } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useReportStats } from '@/hooks/useReportStats';
import { exportCourseTypeStatsToExcel, exportDepartmentAttendeesToExcel } from '@/utils/excelExport';
import { exportCourseTypeStatsToPdf, exportDepartmentAttendeesToPdf } from '@/utils/pdfExport';
import { COURSE_TYPES } from '@/constants/courseTypes';

export const ReportGenerator = () => {
  const [reportDateRange, setReportDateRange] = useState<DateRange | undefined>(undefined);
  const { reportEvents, reportLoading, reportStatsByType, reportDepartmentRankTotals, reportDepartmentRankGrandTotals, totalReportCourses } = useReportStats(reportDateRange);

  const handleDownloadCourseTypeStatsExcel = () => {
    if (!reportDateRange?.from || !reportDateRange?.to) {
      toast({
        title: "Attenzione",
        description: "Seleziona un intervallo di date valido per il report.",
        variant: "destructive",
      });
      return;
    }
    const dateRangeString = `${format(reportDateRange.from, "dd-MM-yyyy")} al ${format(reportDateRange.to, "dd-MM-yyyy")}`;
    exportCourseTypeStatsToExcel(reportStatsByType, [...COURSE_TYPES, 'Non Specificato'], dateRangeString);
  };

  const handleDownloadDepartmentAttendeesExcel = () => {
    if (!reportDateRange?.from || !reportDateRange?.to) {
      toast({
        title: "Attenzione",
        description: "Seleziona un intervallo di date valido per il report.",
        variant: "destructive",
      });
      return;
    }
    const dateRangeString = `${format(reportDateRange.from, "dd-MM-yyyy")} al ${format(reportDateRange.to, "dd-MM-yyyy")}`;
    exportDepartmentAttendeesToExcel(reportDepartmentRankTotals, reportDepartmentRankGrandTotals, dateRangeString);
  };

  const handleDownloadCourseTypeStatsPdf = () => {
    if (!reportDateRange?.from || !reportDateRange?.to) {
      toast({
        title: "Attenzione",
        description: "Seleziona un intervallo di date valido per il report.",
        variant: "destructive",
      });
      return;
    }
    const dateRangeString = `${format(reportDateRange.from, "dd-MM-yyyy")} al ${format(reportDateRange.to, "dd-MM-yyyy")}`;
    exportCourseTypeStatsToPdf(reportStatsByType, [...COURSE_TYPES, 'Non Specificato'], dateRangeString);
  };

  const handleDownloadDepartmentAttendeesPdf = () => {
    if (!reportDateRange?.from || !reportDateRange?.to) {
      toast({
        title: "Attenzione",
        description: "Seleziona un intervallo di date valido per il report.",
        variant: "destructive",
      });
      return;
    }
    const dateRangeString = `${format(reportDateRange.from, "dd-MM-yyyy")} al ${format(reportDateRange.to, "dd-MM-yyyy")}`;
    exportDepartmentAttendeesToPdf(reportDepartmentRankTotals, reportDepartmentRankGrandTotals, dateRangeString);
  };

  return (
    <Card className="shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
          <Download className="mr-3 h-7 w-7" /> Genera Report per Periodo
        </CardTitle>
        <CardDescription>Seleziona un intervallo di date per generare un report Excel o PDF dei corsi per tipo e del riepilogo discenti.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seleziona Intervallo Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${!reportDateRange && "text-muted-foreground"}`}
                disabled={reportLoading}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {reportDateRange?.from ? (
                  reportDateRange.to ? (
                    <>
                      {format(reportDateRange.from, "PPP", { locale: it })} -{" "}
                      {format(reportDateRange.to, "PPP", { locale: it })}
                    </>
                  ) : (
                    format(reportDateRange.from, "PPP", { locale: it })
                  )
                ) : (
                  <span>Seleziona le date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={reportDateRange?.from}
                selected={reportDateRange}
                onSelect={setReportDateRange}
                numberOfMonths={2}
                locale={it}
              />
            </PopoverContent>
          </Popover>
        </div>
        {reportDateRange?.from && reportDateRange?.to && (
          <div className="text-center text-lg font-medium text-gray-700 space-y-2">
            {reportLoading ? (
              <p>Caricamento dati...</p>
            ) : (
              <>
                <p>Trovati <span className="text-blue-600 font-bold">{totalReportCourses}</span> corsi nel periodo selezionato.</p>
                <p>Totale <span className="text-blue-600 font-bold">{reportDepartmentRankGrandTotals.actualTotal}</span> discenti effettivi nel periodo selezionato.</p>
              </>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Report Corsi per Tipo</h3>
            <div className="flex space-x-2">
              <Button
                onClick={handleDownloadCourseTypeStatsExcel}
                disabled={reportLoading || !reportDateRange?.from || !reportDateRange?.to || reportEvents.length === 0}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button
                onClick={handleDownloadCourseTypeStatsPdf}
                disabled={reportLoading || !reportDateRange?.from || !reportDateRange?.to || reportEvents.length === 0}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Riepilogo Discenti</h3>
            <div className="flex space-x-2">
              <Button
                onClick={handleDownloadDepartmentAttendeesExcel}
                disabled={reportLoading || !reportDateRange?.from || !reportDateRange?.to || reportEvents.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button
                onClick={handleDownloadDepartmentAttendeesPdf}
                disabled={reportLoading || !reportDateRange?.from || !reportDateRange?.to || reportEvents.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};