// ... (codice precedente invariato)

// Dati statici per la tabella delle scadenze e-learning (aggiornati)
const staticElearningDeadlines = [
  { type: 'Richiesta Discenti', days: '8 giorni prima', message: 'Richiesta discenti (e-learning)' },
  { type: 'Comunicazione Scuola', days: '7 giorni prima', message: 'Comunicazione alla Scuola PEF/Altro' },
  { type: 'Lettera Abilitazione', days: '1 giorno prima', message: 'Lettera Abilitazione al Corso' },
  { type: 'Mail Sollecito 1', days: '15 giorni dopo inizio', message: 'Prima mail di sollecito' },
  { type: 'Mail Sollecito 2', days: '25 giorni dopo inizio', message: 'Seconda mail di sollecito' },
  { type: 'Avviso Proroga', days: '1 giorno dopo fine', message: 'Avviso Proroga (eventuale)' },
  { type: 'Relazione Finale', days: '30 giorni dopo inizio', message: 'Relazione Finale' },
];

// ... (nel return, modifica la sezione E-learning)
<Card className="shadow-lg bg-green-50">
  <CardHeader>
    <CardTitle className="text-2xl font-semibold text-blue-700 flex items-center">
      <Info className="mr-3 h-7 w-7" /> Scadenze Corsi E-learning
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="mb-6 overflow-x-auto h-[360px]">
      <h4 className="text-lg font-semibold text-gray-700 mb-3">Nuove Regole Scadenze E-learning</h4>
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold w-1/4">Tipo Scadenza</TableHead>
            <TableHead className="text-center font-semibold w-1/4">Periodo</TableHead>
            <TableHead className="font-semibold w-2/4">Azione</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staticElearningDeadlines.map((deadline, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{deadline.type}</TableCell>
              <TableCell className="text-center">
                <span className={`px-2 py-1 rounded-md ${
                  deadline.type.includes('Richiesta') || deadline.type.includes('Comunicazione') 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100'
                }`}>
                  {deadline.days}
                </span>
              </TableCell>
              <TableCell>{deadline.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Sezione Scadenze Imminenti (rimane invariata) */}
    {eventsLoading ? (
      <p className="text-center text-gray-600">Caricamento scadenze...</p>
    ) : elearningDeadlines.length > 0 ? (
      <div className="space-y-4">
        {elearningDeadlines.map((deadline, index) => (
          <div key={index} className={`border rounded-lg p-4 ${
            isToday(deadline.date) 
              ? 'bg-yellow-100 border-yellow-400' 
              : 'bg-slate-50 border-gray-200'
          } hover:bg-slate-100 transition-colors cursor-pointer`}
            onClick={() => navigate(`/evento/${deadline.eventId}`)}>
            <p className="font-medium text-gray-800">{deadline.message}</p>
            <p className={`text-sm ${
              isToday(deadline.date) 
                ? 'text-yellow-700 font-semibold' 
                : 'text-gray-500'
            }`}>
              Scadenza: {format(deadline.date, "PPP", { locale: it })} ({format(deadline.date, "EEEE", { locale: it })})
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-600">Nessuna scadenza imminente per corsi e-learning.</p>
    )}
  </CardContent>
</Card>

// ... (codice successivo invariato)