/ StudyScheduleBuilder.tsx
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ScheduleCalendar from './ScheduleCalendar';
import GenerateScheduleModal from './GenerateScheduleModal';

export default function StudyScheduleBuilder() {
  const [currentView, setCurrentView] = useState('dayGridWeek');

  return (
    <div>
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setCurrentView('dayGridWeek')}
          className={`px-4 py-2 rounded ${currentView === 'dayGridWeek' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Weekly Overview
        </button>
        <button
          onClick={() => setCurrentView('timeGridDay')}
          className={`px-4 py-2 rounded ${currentView === 'timeGridDay' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Daily Schedule
        </button>
      </div>

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
