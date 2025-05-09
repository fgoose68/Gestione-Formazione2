import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useEvent } from '@/hooks/useEvent';
import { Event } from '@/types';

const EditEventPage = () => {
  const { id } = useParams();
  const { getEventById, updateEvent } = useEvent();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const eventData = await getEventById(id);
      setEvent(eventData);
      setLoading(false);
    };
    fetchEvent();
  }, [id, getEventById]);

  if (loading) return <div>Loading event data...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      {/* Your edit form here */}
    </div>
  );
};

export default EditEventPage;