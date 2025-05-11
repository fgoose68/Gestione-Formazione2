import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import IndexPage from "@/pages/Index"; // Rinominato da Index a IndexPage per chiarezza
import NotFound from "@/pages/NotFound";
import NewEvent from "@/pages/NewEvent";
import CalendarPage from "@/pages/CalendarPage";
import ArchivePage from "@/pages/ArchivePage";
import EventDetailPage from "@/pages/EventDetailPage";
import EditEventPage from "@/pages/EditEventPage";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import LoginPage from "@/pages/LoginPage"; 

const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute: useEffect for session check mounted');
    const getSession = async () => {
      console.log('ProtectedRoute: Attempting to get session...');
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('ProtectedRoute: Error getting session:', error);
      }
      console.log('ProtectedRoute: Current session from getSession():', currentSession);
      setSession(currentSession);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`ProtectedRoute: onAuthStateChange event: ${event}, new session:`, newSession);
      setSession(newSession);
      // Se l'evento è SIGNED_IN e la sessione è cambiata, setLoading potrebbe essere già false.
      // Se l'utente si disconnette (SIGNED_OUT), newSession sarà null, e il Navigate a /login scatterà.
      if (loading && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
        setLoading(false); 
      }
    });

    return () => {
      subscription?.unsubscribe();
      console.log('ProtectedRoute: Unsubscribed from auth state changes.');
    };
  }, [loading]); // Aggiunto loading per rieseguire se necessario, anche se getSession è una tantum

  if (loading) {
    console.log('ProtectedRoute: Still loading session state...');
    return <div>Caricamento sessione utente...</div>; // O uno spinner/scheletro più carino
  }

  console.log('ProtectedRoute: Rendering decision. Session:', session, 'Loading:', loading);
  return session ? <Outlet /> : <Navigate to="/login" replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<IndexPage />} /> {/* Usare IndexPage qui */}
            <Route path="/nuovo-evento" element={<NewEvent />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/archivio" element={<ArchivePage />} />
            <Route path="/evento/:id" element={<EventDetailPage />} />
            <Route path="/evento/:id/modifica" element={<EditEventPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;