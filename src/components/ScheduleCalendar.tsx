// ScheduleCalendar.tsx
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import '@fullcalendar/common/index.css';
import '@fullcalendar/daygrid/index.css';
import '@fullcalendar/timegrid/index.css';
import '@fullcalendar/interaction/index.css';  // if you need interaction styles


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
