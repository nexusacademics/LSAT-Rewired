import React, { useState } from 'react';

import { useTheme } from '../contexts/ThemeContext';


export default function StudyScheduleBuilder() {
  const { theme } = useTheme();

  const [testDate, setTestDate] = useState('');
const [startDate, setStartDate] = useState('');
const [weeklyHours, setWeeklyHours] = useState('');
  // --- Async function to call Gemini API ---
  async function generateSchedule() {
    const prompt = `Create a weekly study schedule for a student preparing for a test on ${testDate}, starting on ${startDate}, with ${weeklyHours} hours available per week. Output should include day-by-day entries with topic and duration. Format the result as a JSON array of {title, start, end, description}.`;

    const geminiResponse = await fetch('/api/gemini-schedule', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await geminiResponse.json();
    console.log('Generated schedule:', data.schedule);
    return data.schedule;
  }
  
  // Background and container styling
  const backgroundClasses = theme === 'dark' 
    ? 'bg-gray-900 min-h-screen' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen';
    
  const containerClasses = theme === 'dark'
    ? 'bg-gray-800 text-gray-100 border border-gray-700 shadow-2xl shadow-gray-900/50'
    : 'bg-white text-slate-800 border border-slate-200 shadow-xl shadow-blue-900/10';
    
  // Form element styling
  const labelClasses = theme === 'dark'
    ? 'block mb-2 font-semibold text-gray-200 text-sm uppercase tracking-wide'
    : 'block mb-2 font-semibold text-gray-700 text-sm uppercase tracking-wide';
    
  const inputClasses = theme === 'dark'
    ? 'bg-gray-900 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400/30'
    : 'bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20';
    
  // Button styling with theme-aware colors
  const buttonClasses = theme === 'dark'
    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/30'
    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/30';
    
  // Header styling
  const headerClasses = theme === 'dark'
    ? 'text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400'
    : 'text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600';

  return (
    <div className={backgroundClasses}>
      <div className="flex justify-center items-center pt-16 px-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className={`rounded-2xl p-8 max-w-2xl w-full mx-auto ${containerClasses}`}>
          <h2 className={headerClasses}>
            Study Schedule Builder
          </h2>
          
          <div className="space-y-6">
            <div className="group">
              <label htmlFor="testDate" className={labelClasses}>
                📅 Your Test Date
              </label>
              <input
                type="date"
                id="testDate"
                 value={testDate}
  onChange={(e) => setTestDate(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:scale-[1.02] ${inputClasses}`}
              />
            </div>
            
            <div className="group">
              <label htmlFor="startDate" className={labelClasses}>
                🚀 When do you want to start?
              </label>
              <input
                type="date"
                id="startDate"
                 value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:scale-[1.02] ${inputClasses}`}
              />
            </div>
            
            <div className="group">
              <label htmlFor="weeklyHours" className={labelClasses}>
                ⏰ How many hours per week can you study?
              </label>
              <input
                type="number"
                id="weeklyHours"
                 value={weeklyHours}
  onChange={(e) => setWeeklyHours(e.target.value)}
                min={1}
                placeholder="e.g., 15"
                className={`w-full rounded-xl border px-4 py-3 text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:scale-[1.02] ${inputClasses}`}
              />
            </div>
          </div>
          
          <button
            className={`mt-8 w-full font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${buttonClasses}`}
          >
            ✨ Generate My Schedule
          </button>
          
        
        </div>
      </div>
    </div>
  );
}