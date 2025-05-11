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
import EditEventPage from "@/pages/EditEventPage";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import LoginPage from "@/pages/LoginPage"; 

const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Inizia come true

  useEffect(() => {
    console.log('ProtectedRoute: Sottoscrizione a onAuthStateChange.');

    // Imposta subito il listener.
    // Scatterà con l'evento INITIAL_SESSION che ci dice lo stato corrente.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log(`ProtectedRoute: Evento onAuthStateChange: ${event}, sessione:`, currentSession);
      setSession(currentSession);
      setLoading(false); // Abbiamo lo stato definitivo della sessione (o la sua assenza)
    });

    // Controllo iniziale esplicito della sessione.
    // Questo aiuta a impostare lo stato se onAuthStateChange con INITIAL_SESSION
    // dovesse per qualche motivo tardare o non contenere subito la sessione dopo un login rapido.
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('ProtectedRoute: Controllo getSession() iniziale:', initialSession);
      if (loading) { // Aggiorna solo se onAuthStateChange non ha ancora impostato loading a false
        setSession(initialSession);
        setLoading(false); // Assicura che loading diventi false
      }
    });

    return () => {
      console.log('ProtectedRoute: Annullamento sottoscrizione da onAuthStateChange.');
      subscription?.unsubscribe();
    };
  }, []); // Array di dipendenze vuoto: esegui una volta al mount, pulisci all'unmount

  console.log('ProtectedRoute rendering: loading =', loading, 'sessione =', session);

  if (loading) {
    console.log('ProtectedRoute: Rendering stato di caricamento.');
    return <div>Caricamento sessione...</div>; // O uno spinner più elegante
  }

  if (!session) {
    console.log('ProtectedRoute: Nessuna sessione, navigazione a /login.');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Sessione trovata, rendering Outlet.');
  return <Outlet />;
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
            <Route path="/" element={<Index />} />
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