import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { COURSE_TYPES_MAP } from '@/constants/courseTypes';

export interface MonthlyDepartmentRankTotal {
  department_name: string;
  officers: number;
  inspectors: number;
  superintendents: number;
  militari: number;
  actualTotal: number;
}

export interface MonthlyDepartmentRankGrandTotals {
  officers: number;
  inspectors: number;
  superintendents: number;
  militari: number;
  actualTotal: number;
}

export const exportCourseTypeStatsToPdf = (
  stats: { [key: string]: { count: number; totalActual: number } },
  courseTypesOrder: string[],
  monthYear: string
) => {
  const doc = new jsPDF();
  doc.text(`Statistiche per Tipo di Corso - ${monthYear}`, 10, 10);

  const tableData = courseTypesOrder.map(type => {
    const data = stats[type] || { count: 0, totalActual: 0 };
    return [COURSE_TYPES_MAP[type] || type, data.count, data.totalActual];
  });

  // Calcola totali
  const totalCourses = tableData.reduce((sum, row) => sum + row[1], 0);
  const totalActual = tableData.reduce((sum, row) => sum + row[2], 0);
  tableData.push(['TOTALE', totalCourses, totalActual]);

  autoTable(doc, {
    head: [['Tipo Corso', 'Numero Corsi', 'Totale Discenti Effettivi']],
    body: tableData,
    startY: 20,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 0, 139] }, // Dark blue
    footStyles: { fillColor: [211, 211, 211], textColor: [0, 0, 0] }, // Light gray for total row
  });

  doc.save(`Statistiche_Tipo_Corso_${monthYear.replace(/ /g, '_')}.pdf`);
};

export const exportDepartmentAttendeesToPdf = (
  data: MonthlyDepartmentRankTotal[],
  grandTotals: MonthlyDepartmentRankGrandTotals,
  monthYear: string
) => {
  const doc = new jsPDF();
  doc.text(`Riepilogo Mensile Discenti per Reparto e Grado - ${monthYear}`, 10, 10);

  const tableData = data.map(row => {
    const totalExpectedForDept = row.officers + row.inspectors + row.superintendents + row.militari;
    const absentForDept = Math.max(0, totalExpectedForDept - row.actualTotal);
    return [
      row.department_name,
      row.officers,
      row.inspectors,
      row.superintendents,
      row.militari,
      totalExpectedForDept,
      row.actualTotal,
      absentForDept,
    ];
  });

  // Aggiungi totale
  const grandTotalExpected = grandTotals.officers + grandTotals.inspectors + grandTotals.superintendents + grandTotals.militari;
  const grandTotalAbsent = Math.max(0, grandTotalExpected - grandTotals.actualTotal);
  tableData.push([
    'TOTALE Mese',
    grandTotals.officers,
    grandTotals.inspectors,
    grandTotals.superintendents,
    grandTotals.militari,
    grandTotalExpected,
    grandTotals.actualTotal,
    grandTotalAbsent,
  ]);

  autoTable(doc, {
    head: [['Reparto', 'Uff. (Previsti)', 'Isp. (Previsti)', 'Sovr. (Previsti)', 'Mil./App. (Previsti)', 'Totale Previsti', 'Totale Effettivi', 'Assenti']],
    body: tableData,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 0, 139] },
    footStyles: { fillColor: [211, 211, 211], textColor: [0, 0, 0] },
  });

  doc.save(`Riepilogo_Discenti_${monthYear.replace(/ /g, '_')}.pdf`);
};