import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import NewEvent from "@/pages/NewEvent";
import CalendarPage from "@/pages/CalendarPage";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import LoginPage from "@/pages/LoginPage"; 

const ArchivePage = () => <div className="p-6"><h1 className="text-2xl">Archivio Eventi</h1><p>Qui verranno mostrati gli eventi archiviati.</p></div>;
const EventDetailPage = () => <div className="p-6"><h1 className="text-2xl">Dettaglio Evento</h1><p>Dettagli specifici dell'evento.</p></div>;

const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute: useEffect triggered');
    const getSession = async () => {
      console.log('ProtectedRoute: Getting initial session...');
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('ProtectedRoute: Error getting session:', error);
      }
      console.log('ProtectedRoute: Initial session:', currentSession ? 'Exists' : 'Null');
      setSession(currentSession);
      setLoading(false);
    };

    getSession();

    // Correctly get the subscription object
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log('ProtectedRoute: Auth state changed, event:', _event, 'new session:', newSession ? 'Exists' : 'Null');
      setSession(newSession);
      if (_event === 'PASSWORD_RECOVERY') {
        console.log('ProtectedRoute: Password recovery event detected.');
      }
    });

    // Cleanup function
    return () => {
      subscription?.unsubscribe();
      console.log('ProtectedRoute: Unsubscribed from auth state changes.');
    };
  }, []);

  if (loading) {
    console.log('ProtectedRoute: Loading session...');
    return <div>Caricamento sessione...</div>;
  }

  console.log('ProtectedRoute: Rendering - session:', session ? 'Exists' : 'Null');
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

const queryClient = new QueryClient();

export default App;