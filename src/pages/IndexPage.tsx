import { useEvents, useDeadlines } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, AlertTriangle, Archive, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const IndexPage = () => {
  const navigate = useNavigate();
  const { events, loading } = useEvents();
  const { deadlines } = useDeadlines(events);

  const upcomingEvents = events
    .filter(event => event.status !== 'archiviato')
    .sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime())
    .slice(0, 3);

  const handleForceLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Errore durante il logout:", error);
      toast.error("Errore durante il logout");
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Dashboard</h1>
        <Button 
          onClick={handleForceLogout} 
          variant="ghost"
          className="text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-5 w-5" /> Logout Completo
        </Button>
      </div>

      {/* Sezione Eventi Imminenti */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-6 w-6" />
            Prossimi Eventi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Caricamento eventi...</p>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div 
                  key={event.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/evento/${event.id}`)}
                >
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {format(parseISO(event.start_date), "PPP", { locale: it })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>Nessun evento programmato</p>
          )}
        </CardContent>
      </Card>

      {/* Sezione Scadenze */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-6 w-6" />
            Prossime Scadenze
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deadlines.length > 0 ? (
            <div className="space-y-4">
              {deadlines.slice(0, 3).map((deadline, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="mr-3 h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{deadline.message}</p>
                      <p className="text-sm text-gray-500">
                        {format(deadline.date, "PPP", { locale: it })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Nessuna scadenza imminente</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IndexPage;  // <-- Assicurati che ci sia questa riga