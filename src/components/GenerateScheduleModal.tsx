// components/GenerateScheduleModal.tsx
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleGenerated: (schedule: any[]) => void;
}

const GenerateScheduleModal: React.FC<GenerateScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduleGenerated,
}) => {
  const [testDate, setTestDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSchedule = async () => {
    setLoading(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `
You are an LSAT study planner. Create a week-by-week study schedule starting on ${startDate} for a student preparing for the LSAT on ${testDate}, aiming to study ${weeklyHours} hours per week. Output a JSON array with objects like:

[
  {
    "weekStart": "2025-08-12",
    "topics": ["Logic Games - Basic Diagrams", "Reading Comp - Main Point"],
    "estimatedHours": 12
  }
]
      `.trim();

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);

      const parsed = JSON.parse(jsonString);
      onScheduleGenerated(parsed);
    } catch (err) {
      console.error('Error generating schedule:', err);
      setError('Something went wrong. Please check your inputs or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg max-w-lg w-full space-y-4">
          <Dialog.Title className="text-xl font-bold text-slate-800 dark:text-white">
            🧠 Generate Study Schedule
          </Dialog.Title>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Test Date</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Weekly Study Hours</label>
              <input
                type="number"
                min={1}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={generateSchedule}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default GenerateScheduleModal;
