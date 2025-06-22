import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Info } from 'lucide-react';
import { Event, DepartmentAttendee } from '@/types';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface EventAttendeesDetailTableProps {
  events: Event[];
  attendeesByEvent: Map<string, DepartmentAttendee[]>;
  loading: boolean;
}

export const EventAttendeesDetailTable = ({ events, attendeesByEvent, loading }: EventAttendeesDetailTableProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Info className="mr-2 h-7 w-7" /> Dettaglio Discenti per Corso (Mese Corrente)</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-gray-600">Caricamento dettaglio discenti per corso...</p>
        ) : events.length > 0 ? (
          <div className="space-y-8">
            {events.map(event => {
               const eventAttendeesWithAbsent = (attendeesByEvent.get(event.id) || []).map(att => ({
                  ...att,
                  absent: Math.max(0, (att.expected || 0) - (att.actual || 0)),
               }));

               const eventTotals = eventAttendeesWithAbsent.reduce(
                 (acc, curr) => {
                   acc.officers += curr.officers || 0;
                   acc.inspectors += curr.inspectors || 0;
                   acc.superintendents += curr.superintendents || 0;
                   acc.militari += curr.militari || 0;
                   acc.expected += curr.expected || 0;
                   acc.actual += curr.actual || 0;
                   acc.absent += curr.absent || 0;
                   return acc;
                 },
                 { officers: 0, inspectors: 0, superintendents: 0, militari: 0, expected: 0, actual: 0, absent: 0 }
               );

              return (
                <div key={event.id} className="border rounded-lg p-4 bg-slate-50">
                  <h3 className="text-lg font-bold text-blue-800 mb-3">{event.title}</h3>
                   {event.type && <p className="text-sm text-gray-600 mb-1">Tipo: <span className="font-medium">{event.type}</span></p>}
                   <p className="text-sm text-gray-600 mb-3">
                     Periodo: {format(parseISO(event.start_date), "PPP", { locale: it })} - {format(parseISO(event.end_date), "PPP", { locale: it })}
                   </p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Reparto</TableHead>
                          <TableHead className="text-center font-semibold">Uff.</TableHead>
                          <TableHead className="text-center font-semibold">Isp.</TableHead>
                          <TableHead className="text-center font-semibold">Sovr.</TableHead>
                          <TableHead className="text-center font-semibold">Mil./App.</TableHead>
                          <TableHead className="text-center font-semibold bg-blue-50">Previsti</TableHead>
                          <TableHead className="text-center font-semibold">Effettivi</TableHead>
                          <TableHead className="text-center font-semibold bg-red-50">Assenti</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eventAttendeesWithAbsent.map(att => (
                           <TableRow key={att.department_name}>
                              <TableCell className="font-medium">{att.department_name}</TableCell>
                              <TableCell className="text-center">{att.officers || 0}</TableCell>
                              <TableCell className="text-center">{att.inspectors || 0}</TableCell>
                              <TableCell className="text-center">{att.superintendents || 0}</TableCell>
                              <TableCell className="text-center">{att.militari || 0}</TableCell>
                              <TableCell className="text-center font-medium bg-blue-50">{att.expected || 0}</TableCell>
                              <TableCell className="text-center">{att.actual || 0}</TableCell>
                              <TableCell className="text-center font-medium bg-red-50">{att.absent}</TableCell>
                           </TableRow>
                        )) || (
                           <TableRow><TableCell colSpan={8} className="text-center text-gray-500">Nessun dato discenti per questo evento.</TableCell></TableRow>
                        )}
                      </TableBody>
                       <TableFooter>
                         <TableRow className="bg-slate-100">
                           <TableHead className="font-bold text-slate-800">TOTALE Evento</TableHead>
                           <TableCell className="text-center font-bold text-slate-800">{eventTotals.officers}</TableCell>
                           <TableCell className="text-center font-bold text-slate-800">{eventTotals.inspectors}</TableCell>
                           <TableCell className="text-center font-bold text-slate-800">{eventTotals.superintendents}</TableCell>
                           <TableCell className="text-center font-bold text-slate-800">{eventTotals.militari}</TableCell>
                           <TableCell className="text-center font-bold text-slate-800 bg-blue-50">{eventTotals.expected}</TableCell>
                           <TableCell className="text-center font-bold text-slate-800">{eventTotals.actual}</TableCell>
                           <TableCell className="text-center font-bold text-slate-800 bg-red-50">{eventTotals.absent}</TableCell>
                         </TableRow>
                       </TableFooter>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">Nessun evento trovato per questo mese.</p>
        )}
      </CardContent>
    </Card>
  );
};