"use client";

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTaskContext} from '@/contexts/TaskContext';

// Initialize moment localizer
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  completed: boolean;
}

export default function Upcoming() {
  const { tasks } = useTaskContext();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const taskEvents = tasks.map(task => ({
      id: task.id,
      title: task.text,
      start: task.dueDate!,
      end: task.dueDate!,
      allDay: true,
      completed: task.completed,
    }));
    setEvents(taskEvents);
  }, [tasks]);

  function eventStyleGetter(event: CalendarEvent) {
    const style: React.CSSProperties = {
      backgroundColor: event.completed ? '#d1d5db' : '#ef4444',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block',
    };
    
    if (event.completed) {
      style.textDecoration = 'line-through';
    }

    return {
      style,
    };
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-red-600">Upcoming Tasks</h1>
      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          date={currentDate}
          onNavigate={date => setCurrentDate(date)}
          view={Views.MONTH}
          views={[Views.MONTH]}
        />
      </div>
    </div>
  );
}