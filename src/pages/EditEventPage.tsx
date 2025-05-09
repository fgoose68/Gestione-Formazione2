import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircle } from 'lucide-react';

const EditEventPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Qui andrà la logica per caricare i dati dell'evento e un form simile a NewEvent.tsx
  // precompilato e con logica di update.

  return (
    <div className="container mx-auto p-6">
      <Button onClick={() => navigate(`/evento/${eventId}`)} variant="outline" className="mb-6">
        <ArrowLeftCircle className="mr-2 h-5 w-5" />
        Annulla Modifiche
      </Button>
      <h1 className="text-2xl font-bold text-blue-800 mb-4">Modifica Evento: {eventId}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p>Form di modifica evento (da implementare).</p>
        {/* In futuro, qui ci sarà un form precompilato */}
        <Button className="mt-4 bg-orange-500 hover:bg-orange-600">Salva Modifiche Evento</Button>
      </div>
    </div>
  );
};

export default EditEventPage;