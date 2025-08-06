// components/GenerateScheduleModal.tsx
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleGenerated: (schedule: { date: string; task: string }[]) => void;
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
  const [error, setError] = useState<string | null>(null);

  const generateSchedule = async () => {
    setLoading(true);
    setError(null);

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Create a weekly LSAT study schedule from ${startDate} to ${testDate} with ${weeklyHours} study hours per week. Output an array of objects like [{date: "2025-08-01", task: "Study Logical Reasoning"}].`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      onScheduleGenerated(parsed);
    } catch (err) {
      console.error('Error generating schedule:', err);
      setError('Failed to generate schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-xl z-50 shadow-lg">
        <Dialog.Title className="text
