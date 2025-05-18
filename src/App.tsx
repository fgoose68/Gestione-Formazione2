import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import IndexPage from "@/pages/IndexPage";
import NotFound from "@/pages/NotFound";
import NewEvent from "@/pages/NewEvent";
import CalendarPage from "@/pages/CalendarPage";
import ArchivePage from "@/pages/ArchivePage";
import EventDetailPage from "@/pages/EventDetailPage";
import EditEventPage from "@/pages/EditEventPage";
import StatisticaPage from "@/pages/StatisticaPage";
import Login from "@/pages/Login"; // Importa la pagina di Login
import { SessionContextProvider, useSession } from '@supabase/auth-helpers-react'; // Importa il provider e l'hook
import { supabase } from '@/integrations/supabase/client'; // Importa il client Supabase

const queryClient = new QueryClient();

// Componente wrapper per proteggere le rotte
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const session = useSession();
  // Se la sessione è ancora in fase di caricamento, potresti mostrare uno spinner
  // Per ora, reindirizziamo semplicemente se non c'è sessione
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}> {/* Avvolge l'app con il provider */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rotta di Login non protetta */}
            <Route path="/login" element={<Login />} />

            {/* Rotte protette */}
            <Route path="/" element={<ProtectedRoute><IndexPage /></ProtectedRoute>} />
            <Route path="/nuovo-evento" element={<ProtectedRoute><NewEvent /></ProtectedRoute>} />
            <Route path="/calendario" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/archivio" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
            <Route path="/evento/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
            <Route path="/evento/:id/modifica" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
            <Route path="/statistica" element={<ProtectedRoute><StatisticaPage /></ProtectedRoute>} />
            
            {/* Rotta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;