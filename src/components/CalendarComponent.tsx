import { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { it } from 'date-fns/locale';
import { format } from 'date-fns';

const CalendarComponent = () => {
  const calendarRef = useRef(null);

  useEffect(() => {
    // Imposta la lingua italiana
    if (calendarRef.current) {
      calendarRef.current.getApi().setOption('locale', it);
    }
  }, []);

  const handleDateClick = (arg) => {
    alert(`Nuovo evento per: ${format(arg.date, 'dd/MM/yyyy HH:mm')}`);
  };

  const events = [
    {
      title: 'Corso Sicurezza',
      start: '2023-11-15T09:00:00',
      end: '2023-11-17T17:00:00',
      color: '#1e40af'
    }
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        height="auto"
        events={events}
        dateClick={handleDateClick}
        editable={true}
        selectable={true}
        locale="it"
        buttonText={{
          today: 'Oggi',
          month: 'Mese',
          week: 'Settimana',
          day: 'Giorno'
        }}
      />
    </div>
  );
};

export default CalendarComponent;