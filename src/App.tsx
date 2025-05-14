import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IndexPage from "@/pages/IndexPage";
import NotFound from "@/pages/NotFound";
import NewEvent from "@/pages/NewEvent";
import CalendarPage from "@/pages/CalendarPage";
import ArchivePage from "@/pages/ArchivePage";
import EventDetailPage from "@/pages/EventDetailPage";
import EditEventPage from "@/pages/EditEventPage";
import StatisticaPage from "@/pages/StatisticaPage"; // Importa la nuova pagina

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/nuovo-evento" element={<NewEvent />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/archivio" element={<ArchivePage />} />
          <Route path="/evento/:id" element={<EventDetailPage />} />
          <Route path="/evento/:id/modifica" element={<EditEventPage />} />
          <Route path="/statistica" element={<StatisticaPage />} /> {/* Aggiunge la nuova rotta */}
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const queryClient = new QueryClient();
export default App;