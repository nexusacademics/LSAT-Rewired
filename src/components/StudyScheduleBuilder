// components/StudyScheduleBuilder.tsx
import React, { useState } from 'react';

interface ScheduleEntry {
  date: string;
  activity: string;
}

const StudyScheduleBuilder: React.FC = () => {
  const [testDate, setTestDate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);

  const buildSchedule = () => {
    if (!testDate) {
      alert('Please enter your test date');
      return;
    }

    // Simple demo schedule logic: build a weekly schedule leading up to testDate
    const scheduleEntries: ScheduleEntry[] = [];
    const today = new Date();
    const endDate = new Date(testDate);
    if (endDate <= today) {
      alert('Test date must be in the future');
      return;
    }

    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    let currentDate = new Date(today);

    while (currentDate < endDate) {
      scheduleEntries.push({
        date: currentDate.toDateString(),
        activity: `Drill Practice (${hoursPerWeek / 2} hours)`,
      });
      currentDate = new Date(currentDate.getTime() + msPerWeek);

      if (currentDate < endDate) {
        scheduleEntries.push({
          date: currentDate.toDateString(),
          activity: `Full Practice Test (${hoursPerWeek / 2} hours)`,
        });
        currentDate = new Date(currentDate.getTime() + msPerWeek);
      }
    }

    setSchedule(scheduleEntries);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Study Schedule Builder</h2>
      <div className="mb-4">
        <label htmlFor="testDate" className="block mb-1 font-medium">Your Test Date:</label>
        <input
          type="date"
          id="testDate"
          value={testDate}
          onChange={(e) => setTestDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="hoursPerWeek" className="block mb-1 font-medium">Hours Available per Week:</label>
        <input
          type="number"
          id="hoursPerWeek"
          value={hoursPerWeek}
          min={1}
          max={40}
          onChange={(e) => setHoursPerWeek(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={buildSchedule}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Build Schedule
      </button>

      {schedule.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Your Study Schedule:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {schedule.map((entry, index) => (
              <li key={index}>
                <strong>{entry.date}:</strong> {entry.activity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StudyScheduleBuilder;
