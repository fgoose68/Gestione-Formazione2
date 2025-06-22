import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tag } from 'lucide-react';
import { COURSE_TYPES } from '@/constants/courseTypes';

interface MonthlyCourseTypeStatsProps {
  statsByType: { [key: string]: { count: number; totalActual: number } };
  loading: boolean;
}

export const MonthlyCourseTypeStats = ({ statsByType, loading }: MonthlyCourseTypeStatsProps) => {
  return (
    <Card className="shadow-lg mb-8">
      <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Tag className="mr-3 h-7 w-7" /> Statistiche per Tipo di Corso (Mese Corrente)</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-gray-600">Caricamento statistiche per tipo di corso...</p>
        ) : Object.keys(statsByType).length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Tipo Corso</TableHead>
                <TableHead className="text-center font-semibold">Numero Corsi</TableHead>
                <TableHead className="text-center font-semibold">Totale Discenti Effettivi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...COURSE_TYPES, 'Non Specificato'].map(type => (
                <TableRow key={type}>
                  <TableCell className="font-medium">{type}</TableCell>
                  <TableCell className="text-center">{statsByType[type]?.count || 0}</TableCell>
                  <TableCell className="text-center">{statsByType[type]?.totalActual || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-600">Nessun dato disponibile per le statistiche per tipo nel mese corrente.</p>
        )}
      </CardContent>
    </Card>
  );
};