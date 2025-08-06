// ScheduleCalendar.tsx
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import '@fullcalendar/core/styles/main.css';
import '@fullcalendar/daygrid/styles/main.css';
import '@fullcalendar/timegrid/styles/main.css';

import '@fullcalendar/interaction/styles/main.css';    // if you need interaction styles


export default function ScheduleCalendar({ events }) {
  const [currentView, setCurrentView] = useState('dayGridWeek');

  return (
    <div>
      {/* View toggle buttons */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={currentView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        events={events}
        height="auto"
      />
    </div>
  );
}
