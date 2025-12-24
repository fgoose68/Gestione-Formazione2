export interface SslCourseDefinition {
  code: string;
  title: string;
}

export const SSL_COURSE_DEFINITIONS: SslCourseDefinition[] = [
  { code: 'ANT-MED-NF', title: 'Antincendio Nuova Formazione Rischio Medio' },
  { code: 'ANT-MED-AGG', title: 'Antincendio Aggiornamento Rischio Medio' },
  { code: 'ANT-ELE-NF', title: 'Antincendio Nuova Formazione Rischio Elevato' },
  { code: 'ANT-ELE-AGG', title: 'Antincendio Aggiornamento Rischio Elevato' },
  { code: 'PS-BASE-NF', title: 'Formazione Pronto Soccorso' },
  { code: 'PS-BASE-AGG', title: 'Aggiornamento Pronto Soccorso' },
  { code: 'BLS-BASE-NF', title: 'Nuova Formazione BLSD' },
  { code: 'BLS-BASE-AGG', title: 'Aggiornamento BLSD' },
];

export const SSL_COURSE_CODES = SSL_COURSE_DEFINITIONS.map(d => d.code);