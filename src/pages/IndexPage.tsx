// ... (imports rimangono invariati)

const IndexPage = () => {
  // ... (altri stati e funzioni rimangono invariati)

  // Sezione Scadenze Urgenti modificata
  <section className="mb-10">
    <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
      <AlertTriangle className="mr-3 h-7 w-7 text-red-500" /> Scadenze Urgenti
    </h2>
    {activeEvents.length > 0 ? (
      <div className="space-y-6">
        {activeEvents.map(event => {
          const eventDeadlines = deadlines.filter(d => d.eventId === event.id);
          
          if (eventDeadlines.length === 0) return null;

          return (
            <Card key={event.id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-blue-800">{event.title}</CardTitle>
                <p className="text-sm text-gray-500">
                  {format(parseISO(event.start_date), "PPP", { locale: it })} - {format(parseISO(event.end_date), "PPP", { locale: it })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventDeadlines.map(deadline => {
                    const today = new Date();
                    const daysUntil = differenceInDays(deadline.date, today);
                    
                    let borderColor = 'border-l-yellow-500';
                    let textColor = 'text-yellow-700';
                    let statusText = '';
                    
                    if (isPast(deadline.date) && !isToday(deadline.date)) {
                      borderColor = 'border-l-red-700';
                      textColor = 'text-red-700';
                      statusText = 'SCADUTO';
                    } else if (isToday(deadline.date)) {
                      borderColor = 'border-l-red-500';
                      textColor = 'text-red-600';
                      statusText = 'OGGI';
                    } else if (daysUntil <= 10) {
                      borderColor = 'border-l-orange-500';
                      textColor = 'text-orange-700';
                      statusText = `tra ${daysUntil} giorni`;
                    }

                    return (
                      <div 
                        key={`${event.id}-${deadline.type}`} 
                        className={`border-l-4 ${borderColor} pl-4 py-3`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{deadline.message}</h3>
                            <p className={`text-sm ${textColor}`}>
                              Scadenza: {format(deadline.date, "PPP", { locale: it })} {statusText && `(${statusText})`}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant={deadline.completed ? "default" : "outline"}
                            onClick={() => handleMarkAsCompleted(event.id, deadline.type)}
                            className="ml-4"
                          >
                            {deadline.completed ? (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Completata
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-4 w-4" /> Completa
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(`/evento/${event.id}`)}
                >
                  <Info className="mr-2 h-4 w-4" /> Vai ai dettagli
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    ) : (
      <p className="text-gray-600">Nessun evento attivo con scadenze imminenti.</p>
    )}
  </section>

  // ... (resto del componente rimane invariato)