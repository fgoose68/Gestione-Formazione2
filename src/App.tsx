import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Rimosso Outlet, Navigate
import IndexPage from "@/pages/IndexPage"; // Usiamo IndexPage come pagina principale
import NotFound from "@/pages/NotFound";
import NewEvent from "@/pages/NewEvent";
import CalendarPage from "@/pages/CalendarPage";
import ArchivePage from "@/pages/ArchivePage";
import EventDetailPage from "@/pages/EventDetailPage";
import EditEventPage from "@/pages/EditEventPage"; // Importa la pagina di modifica
// Rimosso: import LoginPage from "@/pages/LoginPage";
// Rimosso: import { useEffect, useState } from "react";
// Rimosso: import { supabase } from "@/integrations/supabase/client";

// Rimosso il componente ProtectedRoute

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Le rotte sono ora accessibili direttamente */}
          <Route path="/" element={<IndexPage />} />
          <Route path="/nuovo-evento" element={<NewEvent />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/archivio" element={<ArchivePage />} />
          <Route path="/evento/:id" element={<EventDetailPage />} />
          <Route path="/evento/:id/modifica" element={<EditEventPage />} />
          
          {/* Rotta di fallback per pagine non trovate */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const queryClient = new QueryClient();
export default App;