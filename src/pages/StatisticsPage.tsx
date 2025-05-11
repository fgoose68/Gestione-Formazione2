import { useEvents, useDepartmentAttendees } from '@/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const StatisticsPage = () => {
  const { events } = useEvents();
  const { attendees: allAttendees } = useDepartmentAttendees();
  const navigate = useNavigate();

  // Filtra solo gli eventi completati o archiviati
  const completedEvents = events.filter(event => 
    event.status === 'completato' || event.status === 'archiviato'
  );

  // Ordina gli eventi per data di inizio (dal più recente)
  const sortedEvents = [...completedEvents].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Statistiche Corsi</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Riepilogo Partecipanti per Corso e Reparto</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Corso</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Comando Regionale</TableHead>
                <TableHead>Provinciale Roma</TableHead>
                <TableHead>Provinciale Latina</TableHead>
                <TableHead>Provinciale Frosinone</TableHead>
                <TableHead>Provinciale Rieti</TableHead>
                <TableHead>Provinciale Viterbo</TableHead>
                <TableHead>ROAN</TableHead>
                <TableHead>ReTLA Lazio</TableHead>
                <TableHead>CAR</TableHead>
                <TableHead>Altri Reparti</TableHead>
                <TableHead className="text-right">Totale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEvents.map(event => {
                const eventAttendees = allAttendees.filter(a => a.event_id === event.id);
                const totalParticipants = eventAttendees.reduce((sum, a) => sum + (a.actual || 0), 0);

                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      {format(parseISO(event.start_date), 'dd/MM/yyyy', { locale: it })} - {' '}
                      {format(parseISO(event.end_date), 'dd/MM/yyyy', { locale: it })}
                    </TableCell>
                    {['Comando Regionale', 'Provinciale Roma', 'Provinciale Latina', 
                      'Provinciale Frosinone', 'Provinciale Rieti', 'Provinciale Viterbo',
                      'ROAN', 'ReTLA Lazio', 'CAR', 'Altri Reparti'].map(dept => {
                      const deptData = eventAttendees.find(a => a.department_name === dept);
                      return (
                        <TableCell key={dept}>
                          {deptData ? deptData.actual : 0}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-medium">
                      {totalParticipants}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPage;