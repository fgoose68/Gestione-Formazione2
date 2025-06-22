import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Users } from 'lucide-react';

interface MonthlyDepartmentRankTableProps {
  monthlyDepartmentRankTotals: {
    department_name: string;
    officers: number;
    inspectors: number;
    superintendents: number;
    militari: number;
    actualTotal: number;
  }[];
  monthlyDepartmentRankGrandTotals: {
    officers: number;
    inspectors: number;
    superintendents: number;
    militari: number;
    actualTotal: number;
  };
  loading: boolean;
}

export const MonthlyDepartmentRankTable = ({
  monthlyDepartmentRankTotals,
  monthlyDepartmentRankGrandTotals,
  loading,
}: MonthlyDepartmentRankTableProps) => {
  return (
    <Card className="shadow-lg mb-8">
      <CardHeader><CardTitle className="text-2xl font-semibold text-blue-700 flex items-center"><Users className="mr-3 h-7 w-7" /> Riepilogo Mensile Discenti per Reparto e Grado</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-gray-600">Caricamento dati discenti...</p>
        ) : monthlyDepartmentRankTotals.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Reparto</TableHead>
                  <TableHead className="text-center font-semibold">Uff. (Previsti)</TableHead>
                  <TableHead className="text-center font-semibold">Isp. (Previsti)</TableHead>
                  <TableHead className="text-center font-semibold">Sovr. (Previsti)</TableHead>
                  <TableHead className="text-center font-semibold">Mil./App. (Previsti)</TableHead>
                  <TableHead className="text-center font-semibold bg-blue-50">Totale Previsti</TableHead>
                  <TableHead className="text-center font-semibold bg-green-50">Totale Effettivi</TableHead>
                  <TableHead className="text-center font-semibold bg-red-50">Assenti</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyDepartmentRankTotals.map(att => {
                   const totalExpectedForDept = att.officers + att.inspectors + att.superintendents + att.militari;
                   const absentForDept = Math.max(0, totalExpectedForDept - att.actualTotal);

                   return (
                      <TableRow key={att.department_name}>
                         <TableCell className="font-medium">{att.department_name}</TableCell>
                         <TableCell className="text-center">{att.officers}</TableCell>
                         <TableCell className="text-center">{att.inspectors}</TableCell>
                         <TableCell className="text-center">{att.superintendents}</TableCell>
                         <TableCell className="text-center">{att.militari}</TableCell>
                         <TableCell className="text-center font-medium bg-blue-50">{totalExpectedForDept}</TableCell>
                         <TableCell className="text-center font-medium bg-green-50">{att.actualTotal}</TableCell>
                         <TableCell className="text-center font-medium bg-red-50">{absentForDept}</TableCell>
                      </TableRow>
                   );
                })}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-slate-100">
                  <TableHead className="font-bold text-slate-800">TOTALE Mese</TableHead>
                  <TableCell className="text-center font-bold text-slate-800">{monthlyDepartmentRankGrandTotals.officers}</TableCell>
                  <TableCell className="text-center font-bold text-slate-800">{monthlyDepartmentRankGrandTotals.inspectors}</TableCell>
                  <TableCell className="text-center font-bold text-slate-800">{monthlyDepartmentRankGrandTotals.superintendents}</TableCell>
                  <TableCell className="text-center font-bold text-slate-800">{monthlyDepartmentRankGrandTotals.militari}</TableCell>
                  <TableCell className="text-center font-bold text-slate-800 bg-blue-100">{monthlyDepartmentRankGrandTotals.officers + monthlyDepartmentRankGrandTotals.inspectors + monthlyDepartmentRankGrandTotals.superintendents + monthlyDepartmentRankGrandTotals.militari}</TableCell>
                  <TableCell className="text-center font-bold text-slate-800 bg-green-100">{monthlyDepartmentRankGrandTotals.actualTotal}</TableCell>
                  <TableCell className="text-center font-bold text-slate-800 bg-red-100">
                     {Math.max(0, (monthlyDepartmentRankGrandTotals.officers + monthlyDepartmentRankGrandTotals.inspectors + monthlyDepartmentRankGrandTotals.superintendents + monthlyDepartmentRankGrandTotals.militari) - monthlyDepartmentRankGrandTotals.actualTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        ) : (
          <p className="text-center text-gray-600">Nessun dato discenti disponibile per questo mese.</p>
        )}
      </CardContent>
    </Card>
  );
};