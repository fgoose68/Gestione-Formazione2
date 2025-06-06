import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import IndexPage from '@/pages/IndexPage';
import NewEvent from '@/pages/NewEvent';
import EventDetailPage from '@/pages/EventDetailPage';
import EditEventPage from '@/pages/EditEventPage';
import ArchivePage from '@/pages/ArchivePage';
import CalendarPage from '@/pages/CalendarPage';
import StatisticaPage from '@/pages/StatisticaPage';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        {session ? (
          <>
            <Route path="/" element={<IndexPage />} />
            <Route path="/new-event" element={<NewEvent />} />
            <Route path="/evento/:id" element={<EventDetailPage />} />
            <Route path="/evento/:id/modifica" element={<EditEventPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/statistiche" element={<StatisticaPage />} />
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;