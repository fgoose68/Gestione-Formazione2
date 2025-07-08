import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, FileText } from "lucide-react";

const ModelliLPage = () => {
  const navigate = useNavigate();
  
  // Sostituisci questo URL con quello della tua web app esterna
  const externalAppUrl = "https://URL_DELLA_TUA_WEBAPP_ESTERNA";

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800 flex items-center">
          <FileText className="mr-3 h-8 w-8" />
          Modelli L
        </h1>
        <Button onClick={() => navigate('/')} className="bg-yellow-400 hover:bg-yellow-500 text-black">
          <Home className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-2 md:p-4 h-[80vh]">
        <iframe
          src={externalAppUrl}
          title="Applicazione Esterna - Modelli L"
          className="w-full h-full border-0 rounded-md"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default ModelliLPage;