// Updated GenerateScheduleModal.tsx
import React, { useState, useEffect } from 'react';
import {
  X, Calendar, Clock, Target, Brain, BookOpen,
  AlertCircle, CheckCircle, Loader
} from 'lucide-react';

interface GenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleGenerated: (schedule: any[]) => void;
}

type FocusAreas = {
  readingComp: boolean;
  logicalReasoning: boolean;
  writing: boolean;
};

const GenerateScheduleModal: React.FC<GenerateScheduleModalProps> = ({ isOpen, onClose, onScheduleGenerated }) => {
  const [testDate, setTestDate] = useState('');
  const [customTestDate, setCustomTestDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('12');
  const [studyIntensity, setStudyIntensity] = useState('moderate');
  const [focusAreas, setFocusAreas] = useState<FocusAreas>({
    readingComp: true,
    logicalReasoning: true,
    writing: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const effectiveTestDate = testDate === 'custom' ? customTestDate : testDate;

  const upcomingTestDates = [
    { date: '2025-08-23', label: 'August 2025 LSAT' },
    { date: '2025-10-11', label: 'October 2025 LSAT' },
    { date: '2025-12-13', label: 'December 2025 LSAT' },
    { date: '2026-02-07', label: 'February 2026 LSAT' }
  ];

  const intensityPresets = {
    light: { hours: '8', label: 'Light (5-10 hrs/week)', description: 'For busy schedules' },
    moderate: { hours: '12', label: 'Moderate (10-15 hrs/week)', description: 'Balanced approach' },
    intensive: { hours: '20', label: 'Intensive (15-25 hrs/week)', description: 'Accelerated prep' }
  };

  useEffect(() => {
    if (!startDate) {
      const today = new Date();
      setStartDate(today.toISOString().split('T')[0]);
    }
  }, []);

  useEffect(() => {
    validateForm();
  }, [testDate, customTestDate, startDate, weeklyHours]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!effectiveTestDate) {
      errors.testDate = 'Test date is required';
    } else if (startDate && new Date(effectiveTestDate) <= new Date(startDate)) {
      errors.testDate = 'Test date must be after start date';
    }

    const studyWeeks = startDate && effectiveTestDate
      ? Math.floor((new Date(effectiveTestDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))
      : 0;

    if (studyWeeks < 4) {
      errors.dateRange = 'We recommend at least 4 weeks of study time';
    } else if (studyWeeks > 24) {
      errors.dateRange = 'Study period longer than 6 months - consider a more intensive schedule';
    }

    const hours = parseInt(weeklyHours);
    if (!weeklyHours || hours < 1) {
      errors.weeklyHours = 'Weekly hours must be at least 1';
    } else if (hours > 40) {
      errors.weeklyHours = 'We recommend no more than 40 hours per week';
    }

    setValidationErrors(errors);
  };

  const extractJsonFromText = (text: string) => {
    const match = text.match(/<json>([\s\S]*?)<\/json>/);
    if (!match) throw new Error('No valid JSON found');
    return JSON.parse(match[1].trim());
  };

  const generateSchedule = async () => {
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    setError('');

    try {
      const selectedAreas = Object.entries(focusAreas)
        .filter(([_, selected]) => selected)
        .map(([area]) => {
          switch (area) {
            case 'readingComp': return 'Reading Comprehension';
            case 'logicalReasoning': return 'Logical Reasoning';
            case 'writing': return 'Writing Sample';
            default: return area;
          }
        });

      const studyWeeks = Math.floor((new Date(effectiveTestDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7));
      const totalDays = Math.floor((new Date(effectiveTestDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const dailyHours = Math.round((parseInt(weeklyHours) / 7) * 10) / 10;
      const intensityLabel = intensityPresets[studyIntensity as keyof typeof intensityPresets].label;

      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `You are an expert LSAT study planner. Create a JSON schedule between <json> and </json>:

<json>
[
  {
    "date": "2025-08-12",
    "tasks": ["Reading Comp - Main Point Questions"],
    "estimatedHours": ${dailyHours}
  }
]
</json>`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const schedule = extractJsonFromText(text);

      onScheduleGenerated(schedule);
      onClose();
    } catch (err) {
      console.error('Error generating schedule:', err);
      setError('Failed to generate schedule. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div>/* ... render logic with testDate === 'custom' conditional input */</div>
  );
};

export default GenerateScheduleModal;
