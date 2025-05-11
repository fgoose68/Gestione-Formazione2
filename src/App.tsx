import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import NewEvent from "@/pages/NewEvent";
import CalendarPage from "@/pages/CalendarPage";
import ArchivePage from "@/pages/ArchivePage";
import EventDetailPage from "@/pages/EventDetailPage";
import EditEventPage from "@/pages/EditEventPage"; // Importa la pagina di modifica
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import LoginPage from "@/pages/LoginPage"; 

const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoading(false);
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription?.unsubscribe();
  }, []);

  if (loading) return <div>Caricamento sessione...</div>;
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
            <Route path="/evento/:id/modifica" element={<EditEventPage />} /> {/* Nuova rotta */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const queryClient = new QueryClient();
export default App;