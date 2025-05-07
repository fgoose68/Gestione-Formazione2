import { Calendar, Clock, FileText, Users, Download, Archive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  // Dati di esempio
  const upcomingEvents = [
    {
      id: 1,
      title: "Sicurezza sul Lavoro",
      date: "15/10/2023",
      daysLeft: 12,
      progress: 75,
      status: "in_preparazione",
      documents: ["Richiesta docenti", "Avvio corso"]
    },
    {
      id: 2,
      title: "Privacy GDPR",
      date: "25/10/2023", 
      daysLeft: 22,
      progress: 40,
      status: "in_preparazione",
      documents: ["Richiesta docenti"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="bg-white text-blue-800 px-2 py-1 rounded mr-2">GESTIO</span>
            FORMAZIONE
          </h1>
          <div className="flex space-x-4">
            <button className="flex items-center px-3 py-2 rounded hover:bg-blue-700">
              <Calendar className="mr-2" size={18} /> Calendario
            </button>
            <button className="flex items-center px-3 py-2 rounded hover:bg-blue-700">
              <Clock className="mr-2" size={18} /> Scadenzario
            </button>
            <button className="flex items-center px-3 py-2 rounded hover:bg-blue-700">
              <FileText className="mr-2" size={18} /> Documenti
            </button>
            <button className="flex items-center px-3 py-2 rounded hover:bg-blue-700">
              <Archive className="mr-2" size={18} /> Archivio
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sezione Nuovo Evento */}
          <Card className="md:col-span-1 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-800">Crea Nuovo Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                + Aggiungi Evento
              </button>
            </CardContent>
          </Card>

          {/* Sezione Calendario */}
          <Card className="md:col-span-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center">
                <Calendar className="mr-2" /> Prossimi Eventi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <p className="text-gray-600">Data: {event.date} ({event.daysLeft} giorni rimanenti)</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === 'in_preparazione' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {event.status === 'in_preparazione' ? 'In preparazione' : 'Completato'}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Progress value={event.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Completamento: {event.progress}%</span>
                        <span>Scadenze: {event.documents.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sezione Scadenzario */}
          <Card className="md:col-span-3 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center">
                <Clock className="mr-2" /> Scadenzario Automatico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 bg-red-50">
                  <h4 className="font-bold text-red-800">30 giorni prima</h4>
                  <p className="text-sm">Redigere documento richiesta docenti</p>
                </div>
                <div className="border rounded-lg p-4 bg-orange-50">
                  <h4 className="font-bold text-orange-800">25 giorni prima</h4>
                  <p className="text-sm">Creare documento richiesta discenti</p>
                </div>
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <h4 className="font-bold text-yellow-800">10 giorni prima</h4>
                  <p className="text-sm">Documento di Avvio Corso</p>
                </div>
                <div className="border rounded-lg p-4 bg-green-50">
                  <h4 className="font-bold text-green-800">Giorno evento</h4>
                  <p className="text-sm">Registro presenze e lezioni</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;