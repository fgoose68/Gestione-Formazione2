import { Calendar, Clock, FileText, Users, Download, Archive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  // Sample data
  const upcomingEvents = [
    {
      id: 1,
      title: "Sicurezza sul Lavoro",
      date: "15/10/2023",
      daysLeft: 12,
      progress: 75,
      status: "in_preparazione",
      document: "Richiesta docenti"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="bg-white text-blue-800 px-2 py-1 rounded mr-2">GESTIO</span>
            FORMAZIONE
          </h1>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center">
                <Calendar className="mr-2" /> Prossimi Eventi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.map(event => (
                <div key={event.id} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between">
                    <h3 className="font-bold">{event.title}</h3>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                  <Progress value={event.progress} className="mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;