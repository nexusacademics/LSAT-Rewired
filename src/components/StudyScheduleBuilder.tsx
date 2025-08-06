// components/StudyScheduleBuilder.tsx
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ScheduleCalendar from './ScheduleCalendar';
import GenerateScheduleModal from './GenerateScheduleModal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';


export default function StudyScheduleBuilder() {
  const { theme } = useTheme();
  const [schedule, setSchedule] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const backgroundClasses = theme === 'dark'
    ? 'bg-gray-900 min-h-screen'
    : 'bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen';

  const buttonClasses = theme === 'dark'
    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/30'
    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/30';

  return (
    <div className={backgroundClasses}>
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
            🗓️ Your Study Calendar
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className={`py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-200 ${buttonClasses}`}
          >
            ✨ Generate New Schedule
          </button>
        </div>

        <ScheduleCalendar schedule={schedule} setSchedule={setSchedule} />

        <GenerateScheduleModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onScheduleGenerated={(newSchedule) => {
            setSchedule(newSchedule);
            setModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
