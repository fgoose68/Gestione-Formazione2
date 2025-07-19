import * as XLSX from 'xlsx';
import { DepartmentAttendee, Event } from '@/types'; // Importa anche Event
import { COURSE_TYPES_MAP } from '@/constants/courseTypes'; // Importa la mappa
import { format, parseISO } from 'date-fns'; // Importa funzioni per formattare date
import { it } from 'date-fns/locale'; // Importa locale italiano

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
  const worksheetData: (string | number)[][] = [
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
  const worksheetData: (string | number)[][] = [
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
      COURSE_TYPES_MAP[type] || type, // Usa la mappa qui, con fallback al tipo originale
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

export const exportCoursesByDepartmentToExcel = (
  events: Event[], // Questi sono gli eventi già filtrati
  attendeesByEvent: Map<string, DepartmentAttendee[]>, // Questa mappa contiene solo i discenti del reparto selezionato per gli eventi filtrati
  grandTotals: MonthlyDepartmentRankGrandTotals, // Questi sono i totali complessivi dei discenti per il periodo e reparto
  dateRangeString: string,
  selectedDepartmentName?: string // Nuovo parametro opzionale
) => {
  const title = selectedDepartmentName 
    ? `Riepilogo Corsi per Reparto: ${selectedDepartmentName} - ${dateRangeString}`
    : `Riepilogo Corsi per Reparto - ${dateRangeString}`;

  const worksheetData: (string | number)[][] = [
    [title],
    [], // Empty row for spacing
  ];

  const headerRow = ["Reparto", "Uff.", "Isp.", "Sovr.", "Mil./App.", "Previsti", "Effettivi", "Assenti"];

  events.forEach(event => {
    // Ora attendeesByEvent contiene già solo i discenti del reparto selezionato per questo evento
    const filteredEventAttendees = attendeesByEvent.get(event.id) || [];
    
    // Non è più necessario il controllo filteredEventAttendees.length === 0 qui,
    // perché gli eventi passati a questa funzione sono già stati filtrati per avere discenti effettivi.

    worksheetData.push([`Corso: ${event.title}`]);
    worksheetData.push([`Periodo: ${format(parseISO(event.start_date), "PPP", { locale: it })} - ${format(parseISO(event.end_date), "PPP", { locale: it })}`]);
    if (event.type) worksheetData.push([`Tipo: ${COURSE_TYPES_MAP[event.type] || event.type}`]);
    if (event.location) worksheetData.push([`Luogo: ${event.location}`]);
    worksheetData.push([]); // Empty row for spacing

    worksheetData.push(headerRow);

    let eventTotalOfficers = 0;
    let eventTotalInspectors = 0;
    let eventTotalSuperintendents = 0;
    let eventTotalMilitari = 0;
    let eventTotalExpected = 0;
    let eventTotalActual = 0;
    let eventTotalAbsent = 0;

    filteredEventAttendees.forEach(att => {
      const expected = att.officers + att.inspectors + att.superintendents + att.militari;
      const absent = Math.max(0, expected - att.actual);
      worksheetData.push([
        att.department_name,
        att.officers,
        att.inspectors,
        att.superintendents,
        att.militari,
        expected,
        att.actual,
        absent,
      ]);
      eventTotalOfficers += att.officers;
      eventTotalInspectors += att.inspectors;
      eventTotalSuperintendents += att.superintendents;
      eventTotalMilitari += att.militari;
      eventTotalExpected += expected;
      eventTotalActual += att.actual;
      eventTotalAbsent += absent;
    });

    // Add event totals row
    worksheetData.push([
      "TOTALE Evento",
      eventTotalOfficers,
      eventTotalInspectors,
      eventTotalSuperintendents,
      eventTotalMilitari,
      eventTotalExpected,
      eventTotalActual,
      eventTotalAbsent,
    ]);
    worksheetData.push([]); // Empty row after each event's table
    worksheetData.push([]); // Another empty row for more spacing
  });

  // grandTotals è già il totale complessivo per il reparto selezionato
  const grandTotalExpected = grandTotals.officers + grandTotals.inspectors + grandTotals.superintendents + grandTotals.militari;
  const grandTotalAbsent = Math.max(0, grandTotalExpected - grandTotals.actualTotal);

  worksheetData.push([
    "TOTALE COMPLESSIVO PERIODO",
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
    { wch: 25 }, // Reparto / Corso Title
    { wch: 10 }, // Uff.
    { wch: 10 }, // Isp.
    { wch: 10 }, // Sovr.
    { wch: 12 }, // Mil./App.
    { wch: 12 }, // Previsti
    { wch: 12 }, // Effettivi
    { wch: 10 }, // Assenti
  ];
  ws['!cols'] = wscols;

  // Apply styles (simplified for this example, full styling would be more complex)
  // Merge cells for the main title
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headerRow.length - 1 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Riepilogo Corsi per Reparto");
  XLSX.writeFile(wb, `Riepilogo_Corsi_Reparto_${selectedDepartmentName ? selectedDepartmentName.replace(/ /g, '_') + '_' : ''}${dateRangeString.replace(/ /g, '_')}.xlsx`);
};