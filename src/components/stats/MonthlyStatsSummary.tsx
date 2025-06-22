import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CalendarDays, Users } from 'lucide-react';

interface MonthlyStatsSummaryProps {
  totalCoursesMonth: number;
  totalActualAttendeesMonth: number;
}

export const MonthlyStatsSummary = ({ totalCoursesMonth, totalActualAttendeesMonth }: MonthlyStatsSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="shadow-lg">
        <CardHeader><CardTitle className="text-xl font-semibold text-blue-700 flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-orange-500" /> Totale Corsi nel Mese</CardTitle></CardHeader>
        <CardContent><p className="text-4xl font-bold text-center text-blue-900">{totalCoursesMonth}</p></CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader><CardTitle className="text-xl font-semibold text-blue-700 flex items-center"><Users className="mr-2 h-6 w-6 text-orange-500" /> Totale Discenti Effettivi</CardTitle></CardHeader>
        <CardContent><p className="text-4xl font-bold text-center text-blue-900">{totalActualAttendeesMonth}</p></CardContent>
      </Card>
    </div>
  );
};