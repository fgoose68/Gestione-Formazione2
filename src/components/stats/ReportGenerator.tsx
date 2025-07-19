import { useState, useMemo } from 'react';
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
import { exportCourseTypeStatsToExcel, exportDepartmentAttendeesToExcel, exportCoursesByDepartmentToExcel } from '@/utils/excelExport';
import { COURSE_TYPES } from '@/constants/courseTypes';
import { DepartmentAttendee } from '@/types'; // Import the missing interface

export const ReportGenerator = () => {
  const [reportDateRange, setReportDateRange] = useState<DateRange | undefined>(undefined);
  const { reportEvents, reportLoading, reportStatsByType, reportDepartmentRankTotals, reportDepartmentRankGrandTotals, totalReportCourses, reportAttendees } = useReportStats(reportDateRange);

  // Raggruppa discenti per evento per la visualizzazione dettagliata nel report
  const attendeesByEvent = useMemo(() => {
    const map = new Map<string, DepartmentAttendee[]>();
    reportAttendees.forEach(att => {
      if (!map.has(att.event_id)) {
        map.set(att.event_id, []);
      }
      map.get(att.event_id)?.push(att);
    });
    return map;
  }, [reportAttendees]);


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

  const handleDownloadCoursesByDepartmentExcel = () => {
    if (!reportDateRange?.from || !reportDateRange?.to) {
      toast({
        title: "Attenzione",
        description: "Seleziona un intervallo di date valido per il report.",
        variant: "destructive",
      });
      return;
    }
    const dateRangeString = `${format(reportDateRange.from, "dd-MM-yyyy")} al ${format(reportDateRange.to, "dd-MM-yyyy")}`;
    exportCoursesByDepartmentToExcel(reportEvents, attendeesByEvent, reportDepartmentRankGrandTotals, dateRangeString);
  };

  return (
    <Card className="shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
          <Download className="mr-3 h-7 w-7" /> Genera Report per Periodo
        </CardTitle>
        <CardDescription>Seleziona un intervallo di date per generare un report Excel dei corsi per tipo e del riepilogo discenti.</CardDescription>
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
        <Button
          onClick={handleDownloadCourseTypeStatsExcel}
          disabled={reportLoading || !reportDateRange?.from || !reportDateRange?.to || reportEvents.length === 0}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Scarica Report Corsi per Tipo
        </Button>
        <Button
          onClick={handleDownloadDepartmentAttendeesExcel}
          disabled={reportLoading || !reportDateRange?.from || !reportDateRange?.to || reportEvents.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Scarica Riepilogo Discenti
        </Button>
        <Button
          onClick={handleDownloadCoursesByDepartmentExcel}
          disabled={reportLoading || !reportDateRange?.from || !reportDateRange?.to || reportEvents.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Scarica Riepilogo Corsi per Reparto
        </Button>
      </CardContent>
    </Card>
  );
};