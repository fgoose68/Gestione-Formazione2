import { useEvents, useDeadlines } from '@/hooks';
// ... altre importazioni

const Index = () => {
  const { events, loading, addEvent } = useEvents();
  const { deadlines } = useDeadlines(events);

  // ... resto del componente con events e deadlines invece dei dati mock
};