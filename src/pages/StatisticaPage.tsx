import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, BarChart2 } from "lucide-react";

const StatisticaPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800 flex items-center">
          <BarChart2 className="mr-2 h-6 w-6" />
          Statistiche Eventi
        </h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p>Qui verranno visualizzate le statistiche degli eventi.</p>
        {/* Aggiungi qui la logica per visualizzare le statistiche */}
      </div>
    </div>
  );
};

export default StatisticaPage;