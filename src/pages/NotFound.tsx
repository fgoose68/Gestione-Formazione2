import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button"; // Importa il componente Button

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        {/* Sostituito <a> con Button e applicato stile giallo/nero */}
        <Button onClick={() => window.location.href = '/'} className="bg-yellow-400 hover:bg-yellow-500 text-black">
          Torna alla Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;