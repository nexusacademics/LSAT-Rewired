// components/ScheduleCalendar.tsx
import React from 'react';

interface ScheduleItem {
  weekStart: string;
  topics: string[];
  estimatedHours: number;
}

interface ScheduleCalendarProps {
  schedule: ScheduleItem[];
  setSchedule: (schedule: ScheduleItem[]) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ schedule }) => {
  if (schedule.length === 0) {
    return (
      <div className="mt-8 text-slate-500 text-center">
        No schedule yet. Click "Generate New Schedule" to get started!
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {schedule.map((week, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow border">
          <h3 className="font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
            Week of {week.weekStart}
          </h3>
          <ul className="list-disc list-inside text-slate-700 dark:text-slate-200">
            {week.topics.map((topic, tIdx) => (
              <li key={tIdx}>{topic}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-slate-500">
            ⏱ {week.estimatedHours} hours
          </p>
        </div>
      ))}
    </div>
  );
};

export default ScheduleCalendar;
