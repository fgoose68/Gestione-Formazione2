import { useEvents } from '@/hooks';
// ... altre importazioni

const NewEvent = () => {
  const { addEvent } = useEvents();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: null,
    end_date: null,
    location: '',
    teachers: [],
    students: []
  });

  const handleSubmit = async () => {
    const newEvent = await addEvent(formData);
    if (newEvent) {
      // Reindirizza alla dashboard
    }
  };

  // ... resto del componente con gestione form
};