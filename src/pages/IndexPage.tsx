// ... (codice precedente invariato)

// Dati statici per la tabella delle scadenze e-learning
const staticElearningDeadlines = [
  { 
    type: 'Richiesta Discenti', 
    days: '8 giorni prima', // Modificato da 5 a 8
    message: 'Richiesta discenti (e-learning)' 
  },
  { 
    type: 'Comunicazione Scuola', 
    days: '7 giorni prima', // Modificato da 3 a 7
    message: 'Comunicazione alla Scuola PEF/Altro' 
  },
  { 
    type: 'Lettera Abilitazione', 
    days: '1 giorno prima', 
    message: 'Lettera Abilitazione al Corso' 
  },
  { 
    type: 'Mail Sollecito 1', 
    days: '15 giorni dopo inizio', 
    message: 'Prima mail di sollecito' 
  },
  { 
    type: 'Mail Sollecito 2', 
    days: '25 giorni dopo inizio', 
    message: 'Seconda mail di sollecito' 
  },
  { 
    type: 'Avviso Proroga', 
    days: '1 giorno dopo fine', 
    message: 'Avviso Proroga (eventuale)' 
  },
  { 
    type: 'Relazione Finale', 
    days: '30 giorni dopo inizio', 
    message: 'Relazione Finale' 
  },
];

// ... (resto del codice invariato)