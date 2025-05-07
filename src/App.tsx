import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import NewEvent from "@/pages/NewEvent";
import CalendarPage from "@/pages/CalendarPage";
import { supabase } from "@/integrations/supabase/client"; // Importa supabase
import { useEffect, useState } from "react";
import LoginPage from "@/pages/LoginPage"; // Pagina da creare

// Placeholder per pagina Archivio e Dettaglio Evento
const ArchivePage = () => <div className="p-6"><h1 className="text-2xl">Archivio Eventi</h1><p>Qui verranno mostrati gli eventi archiviati.</p></div>;
const EventDetailPage = () => <div className="p-6"><h1 className="text-2xl">Dettaglio Evento</h1><p>Dettagli specifici dell'evento.</p></div>;


const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'PASSWORD_RECOVERY') {
        // Potresti voler reindirizzare a una pagina di reset password
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Caricamento sessione...</div>; // O uno spinner
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Index />} />
            <Route path="/nuovo-evento" element={<NewEvent />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/archivio" element={<ArchivePage />} />
            <Route path="/evento/:id" element={<EventDetailPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const queryClient = new QueryClient(); // queryClient deve essere definito prima di App

export default App;