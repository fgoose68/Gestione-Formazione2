import { Calendar } from '@/components/ui/calendar';

const CalendarPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Calendario Eventi Formativi</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <Calendar
          mode="multiple"
          className="w-full"
          modifiers={{
            event: [
              new Date(2023, 9, 15),
              new Date(2023, 9, 25),
              new Date(2023, 10, 5)
            ]
          }}
          modifiersStyles={{
            event: {
              border: '2px solid #1E40AF',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF'
            }
          }}
        />
      </div>
    </div>
  );
};

export default CalendarPage;