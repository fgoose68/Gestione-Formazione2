import { Calendar, Clock, FileText, Users, ClipboardList, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-8 w-8" />
            <h1 className="text-2xl font-bold">GESTIOFORMAZIONE</h1>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="flex items-center space-x-1 hover:text-orange-300 transition">
              <Calendar className="h-5 w-5" />
              <span>Calendario</span>
            </a>
            <a href="#" className="flex items-center space-x-1 hover:text-orange-300 transition">
              <Clock className="h-5 w-5" />
              <span>Scadenzario</span>
            </a>
            <a href="#" className="flex items-center space-x-1 hover:text-orange-300 transition">
              <FileText className="h-5 w-5" />
              <span>Documenti</span>
            </a>
            <a href="#" className="flex items-center space-x-1 hover:text-orange-300 transition">
              <Users className="h-5 w-5" />
              <span>Feedback</span>
            </a>
            <a href="#" className="flex items-center space-x-1 hover:text-orange-300 transition">
              <Archive className="h-5 w-5" />
              <span>Archivio</span>
            </a>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 hidden md:block">
            Nuovo Evento
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard Summary */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Dashboard Eventi</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Card */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">Corso Sicurezza</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">In programma</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">15-17 Nov 2023</p>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Scadenze</span>
                    <span>3/4 completate</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>

              {/* Add more event cards here */}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Scadenze Imminenti</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <p className="font-medium">Richiesta docenti</p>
                <p className="text-sm text-gray-600">Corso Sicurezza - Scade tra 5 giorni</p>
              </div>
              {/* Add more deadline items here */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;