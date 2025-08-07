import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import GenerateScheduleModal from './GenerateScheduleModal';

export default function StudyScheduleBuilder() {
  const [currentView, setCurrentView] = useState('dayGridWeek');
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform Gemini output into FullCalendar events
  const handleScheduleGenerated = (schedule: any[]) => {
    const transformed = schedule.map((item, index) => ({
      id: String(index),
      title: item.topics.join(', '),
      start: item.weekStart,
      allDay: true,
    }));
    setEvents(transformed);
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* View Toggle */}
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Generate Schedule
        </button>
      </div>

      {/* Calendar */}
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

      {/* Modal */}
      <GenerateScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScheduleGenerated={handleScheduleGenerated}
      />
    </div>
  );
}
