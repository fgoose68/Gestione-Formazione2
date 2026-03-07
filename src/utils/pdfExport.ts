import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { COURSE_TYPES_MAP } from '@/constants/courseTypes';

export const exportCourseTypeStatsToPdf = (
  stats: { [key: string]: { count: number; totalActual: number } },
  courseTypesOrder: string[],
  monthYear: string
) => {
  const doc = new jsPDF();
  doc.text(`Statistiche per Tipo di Corso - ${monthYear}`, 10, 10);

  const tableData = courseTypesOrder.map(type => {
    const data = stats[type] || { count: 0, totalActual: 0 };
    return [
      COURSE_TYPES_MAP[type] || type,
      data.count,
      data.totalActual,
    ];
  });

  autoTable(doc, {
    head: [['Tipo Corso', 'Numero Corsi', 'Totale Discenti Effettivi']],
    body: tableData,
    startY: 20,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 0, 139] },
    footStyles: { fillColor: [211, 211, 211], textColor: [0, 0, 0] },
  });

  doc.save(`Statistiche_Tipo_Corso_${monthYear.replace(/ /g, '_')}.pdf`);
};

export const exportDepartmentAttendeesToPdf = (
  data: MonthlyDepartmentRankTotal[],
  grandTotals: MonthlyDepartmentRankGrandTotals,
  monthYear: string
) => {
  const doc = new jsPDF();
  doc.text(`Riepilogo Discenti per Reparto e Grado - ${monthYear}`, 10, 10);

  const tableData = data.map(row => [
    row.department_name,
    row.officers,
    row.inspectors,
    row.superintendents,
    row.militari,
    row.expected,
    row.actualTotal,
  ]);

  autoTable(doc, {
    head: [['Reparto', 'Uff. (Previsti)', 'Isp. (Previsti)', 'Sovr. (Previsti)', 'Mil./App. (Previsti)', 'Totale Previsti', 'Totale Effettivi']],
    body: tableData,
    startY: 20,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 0, 139] },
    footStyles: { fillColor: [211, 211, 211], textColor: [0, 0, 0] },
  });

  doc.save(`Riepilogo_Discenti_${monthYear.replace(/ /g, '_')}.pdf`);
};