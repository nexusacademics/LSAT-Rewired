import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function StudyScheduleBuilder() {
  const { theme } = useTheme();

  const boxClasses = theme === 'dark'
    ? 'bg-gray-800 text-gray-100 border border-gray-700'
    : 'bg-white text-slate-800 border border-slate-200';

  const inputClasses = theme === 'dark'
    ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400'
    : 'bg-white border-gray-300 text-slate-900 placeholder-slate-400';

  return (
    <div className={`rounded-2xl shadow-md p-6 max-w-3xl mx-auto mt-10 ${boxClasses}`}>
      <h2 className="text-2xl font-semibold mb-4">Build Your Study Schedule</h2>

      <form className="space-y-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputClasses}`}
          />
        </div>

        <div>
          <label htmlFor="targetDate" className="block text-sm font-medium mb-1">
            Target Test Date
          </label>
          <input
            type="date"
            id="targetDate"
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputClasses}`}
          />
        </div>

        <div>
          <label htmlFor="weeklyHours" className="block text-sm font-medium mb-1">
            Weekly Study Hours
          </label>
          <input
            type="number"
            id="weeklyHours"
            placeholder="e.g. 10"
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputClasses}`}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
          >
            Generate Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
