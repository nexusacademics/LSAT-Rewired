import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function StudyScheduleBuilder() {
  const { theme } = useTheme();

  const boxClasses =
    theme === 'dark'
      ? 'bg-gray-800 text-gray-100 border border-gray-700'
      : 'bg-white text-slate-800 border border-slate-200';

  const labelClasses =
    theme === 'dark'
      ? 'block mb-1 font-medium text-gray-300'
      : 'block mb-1 font-medium text-gray-700';

  const inputClasses =
    theme === 'dark'
      ? 'bg-gray-900 border border-gray-700 text-white placeholder-gray-400'
      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500';

  const calendarIconFix =
    theme === 'dark'
      ? { filter: 'invert(1)' }
      : {};

  return (
    <div className={`rounded-xl shadow-lg p-6 max-w-2xl mx-auto mt-8 ${boxClasses}`}>
      <h2 className="text-2xl font-semibold mb-4">Study Schedule Builder</h2>

      <div className="mb-4">
        <label htmlFor="testDate" className={labelClasses}>
          Your Test Date:
        </label>
        <input
          type="date"
          id="testDate"
          className={`w-full rounded-lg border px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputClasses} ${theme === 'dark' ? 'dark-input' : ''}`}
          style={calendarIconFix}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="startDate" className={labelClasses}>
          When do you want to start?
        </label>
        <input
          type="date"
          id="startDate"
          className={`w-full rounded-lg border px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputClasses} ${theme === 'dark' ? 'dark-input' : ''}`}
          style={calendarIconFix}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="weeklyHours" className={labelClasses}>
          How many hours per week can you study?
        </label>
        <input
          type="number"
          id="weeklyHours"
          min={1}
          className={`w-full rounded-lg border px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputClasses} ${theme === 'dark' ? 'dark-input' : ''}`}
        />
      </div>

      <button
        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        Generate Schedule
      </button>
    </div>
  );
}
