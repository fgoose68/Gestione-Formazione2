import * as XLSX from 'xlsx';
import { DepartmentAttendee } from '@/types';

interface MonthlyDepartmentRankTotal {
  department_name: string;
  officers: number;
  inspectors: number;
  superintendents: number;
  militari: number;
  actualTotal: number;
}

interface MonthlyDepartmentRankGrandTotals {
  officers: number;
  inspectors: number;
  superintendents: number;
  militari: number;
  actualTotal: number;
}

// Nuove interfacce per l'esportazione delle statistiche per tipo di corso
interface CourseTypeStats {
  [key: string]: {
    count: number;
    totalActual: number;
  };
}

export const exportDepartmentAttendeesToExcel = (
  data: MonthlyDepartmentRankTotal[],
  grandTotals: MonthlyDepartmentRankGrandTotals,
  monthYear: string
) => {
  const worksheetData = [
    ["Riepilogo Mensile Discenti per Reparto e Grado - " + monthYear],
    [], // Empty row for spacing
    ["Reparto", "Uff. (Previsti)", "Isp. (Previsti)", "Sovr. (Previsti)", "Mil./App. (Previsti)", "Totale Previsti", "Totale Effettivi", "Assenti"],
  ];

  data.forEach(row => {
    const totalExpectedForDept = row.officers + row.inspectors + row.superintendents + row.militari;
    const absentForDept = Math.max(0, totalExpectedForDept - row.actualTotal);
    worksheetData.push([
      row.department_name,
      row.officers,
      row.inspectors,
      row.superintendents,
      row.militari,
      totalExpectedForDept,
      row.actualTotal,
      absentForDept,
    ]);
  });

  // Add grand totals row
  const grandTotalExpected = grandTotals.officers + grandTotals.inspectors + grandTotals.superintendents + grandTotals.militari;
  const grandTotalAbsent = Math.max(0, grandTotalExpected - grandTotals.actualTotal);
  worksheetData.push([
    "TOTALE Mese",
    grandTotals.officers,
    grandTotals.inspectors,
    grandTotals.superintendents,
    grandTotals.militari,
    grandTotalExpected,
    grandTotals.actualTotal,
    grandTotalAbsent,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for better readability
  const wscols = [
    { wch: 20 }, // Reparto
    { wch: 15 }, // Uff. (Previsti)
    { wch: 15 }, // Isp. (Previsti)
    { wch: 15 }, // Sovr. (Previsti)
    { wch: 18 }, // Mil./App. (Previsti)
    { wch: 18 }, // Totale Previsti
    { wch: 18 }, // Totale Effettivi
    { wch: 10 }, // Assenti
  ];
  ws['!cols'] = wscols;

  // Merge cells for the title
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]; // Merge first row across all columns

  // Style the header row (row 2, 0-indexed)
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "00008B" } }, // Dark blue background
    alignment: { horizontal: "center" }
  };
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:H1'); // Get range of the sheet
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cell = ws[XLSX.utils.encode_cell({ r: 2, c: C })];
    if (cell) {
      cell.s = headerStyle;
    }
  }

  // Style the grand total row (last row)
  const grandTotalRowIndex = worksheetData.length - 1;
  const grandTotalStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "D3D3D3" } }, // Light gray background
    alignment: { horizontal: "center" }
  };
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cell = ws[XLSX.utils.encode_cell({ r: grandTotalRowIndex, c: C })];
    if (cell) {
      cell.s = grandTotalStyle;
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Riepilogo Discenti");
  XLSX.writeFile(wb, `Riepilogo_Discenti_${monthYear.replace(/ /g, '_')}.xlsx`);
};


export const exportCourseTypeStatsToExcel = (
  stats: CourseTypeStats,
  courseTypesOrder: string[], // Array con l'ordine desiderato dei tipi di corso
  monthYear: string
) => {
  const worksheetData = [
    ["Statistiche per Tipo di Corso - " + monthYear],
    [], // Empty row for spacing
    ["Tipo Corso", "Numero Corsi", "Totale Discenti Effettivi"],
  ];

  let totalCourses = 0;
  let totalActualAttendees = 0;

  // Aggiungi i dati per ogni tipo di corso nell'ordine specificato
  courseTypesOrder.forEach(type => {
    const data = stats[type] || { count: 0, totalActual: 0 };
    worksheetData.push([
      type,
      data.count,
      data.totalActual,
    ]);
    totalCourses += data.count;
    totalActualAttendees += data.totalActual;
  });

  // Aggiungi la riga del totale
  worksheetData.push([
    "TOTALE",
    totalCourses,
    totalActualAttendees,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const wscols = [
    { wch: 25 }, // Tipo Corso
    { wch: 15 }, // Numero Corsi
    { wch: 25 }, // Totale Discenti Effettivi
  ];
  ws['!cols'] = wscols;

  // Merge cells for the title
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

  // Style the header row (row 2, 0-indexed)
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "00008B" } }, // Dark blue background
    alignment: { horizontal: "center" }
  };
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:C1');
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cell = ws[XLSX.utils.encode_cell({ r: 2, c: C })];
    if (cell) {
      cell.s = headerStyle;
    }
  }

  // Style the grand total row (last row)
  const grandTotalRowIndex = worksheetData.length - 1;
  const grandTotalStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "D3D3D3" } }, // Light gray background
    alignment: { horizontal: "center" }
  };
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cell = ws[XLSX.utils.encode_cell({ r: grandTotalRowIndex, c: C })];
    if (cell) {
      cell.s = grandTotalStyle;
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Statistiche per Tipo Corso");
  XLSX.writeFile(wb, `Statistiche_Tipo_Corso_${monthYear.replace(/ /g, '_')}.xlsx`);
};