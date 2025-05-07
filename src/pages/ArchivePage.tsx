import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const ArchivePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Archivio Eventi</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p>Qui verranno mostrati gli eventi archiviati.</p>
        {/* Aggiungi qui la logica per visualizzare gli eventi archiviati */}
      </div>
    </div>
  );
};

export default ArchivePage;