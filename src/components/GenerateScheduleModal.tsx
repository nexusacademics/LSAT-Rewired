// src/components/GenerateScheduleModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Target, Brain, BookOpen, Scale, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Ensure this import is present

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
  const [weeklyHours, setWeeklyHours] = useState('12');
  const [studyIntensity, setStudyIntensity] = useState('moderate');
  const [focusAreas, setFocusAreas] = useState({
    readingComp: true,
    logicalReasoning: true,
    writing: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  // Smart defaults and upcoming test dates
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

  // Auto-set start date to today
  useEffect(() => {
    if (!startDate) {
      const today = new Date();
      setStartDate(today.toISOString().split('T')[0]);
    }
  }, []);

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [testDate, startDate, weeklyHours]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!testDate) {
      errors.testDate = 'Test date is required';
    } else if (startDate && new Date(testDate) <= new Date(startDate)) {
      errors.testDate = 'Test date must be after start date';
    }
    
    const studyWeeks = startDate && testDate ? 
      Math.floor((new Date(testDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)) : 0;
    
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

  const generatePreview = () => {
    const studyWeeks = Math.floor((new Date(testDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7));
    const totalDays = Math.floor((new Date(testDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const totalHours = studyWeeks * parseInt(weeklyHours);
    const selectedAreas = Object.entries(focusAreas).filter(([_, selected]) => selected).map(([area, _]) => area);
    
    setPreview({
      studyWeeks,
      totalDays,
      totalHours,
      weeklyHours: parseInt(weeklyHours),
      focusAreas: selectedAreas,
      intensity: intensityPresets[studyIntensity as keyof typeof intensityPresets].label
    });
    setShowPreview(true);
  };

  // Helper function to extract JSON from a markdown code block
  const extractJsonFromMarkdown = (text: string): string | null => {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    return match ? match[1] : null;
  };

  const generateSchedule = async () => {
    if (Object.keys(validationErrors).length > 0) return;
    
    setLoading(true);
    setError('');

    try {
      // Get selected focus areas for the prompt
      const selectedAreas = Object.entries(focusAreas)
        .filter(([_, selected]) => selected)
        .map(([area, _]) => {
          switch (area) {
            case 'readingComp': return 'Reading Comprehension';
            case 'logicalReasoning': return 'Logical Reasoning';
            case 'writing': return 'Writing Sample';
            default: return area;
          }
        });

      const studyWeeks = Math.floor((new Date(testDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7));
      const totalDays = Math.floor((new Date(testDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const dailyHours = Math.round((parseInt(weeklyHours) / 7) * 10) / 10; // Round to 1 decimal
      const intensityLevel = intensityPresets[studyIntensity as keyof typeof intensityPresets].label;

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `# Enhanced LSAT Study Calendar Prompt for Gemini

You are an expert LSAT study planner specializing in a structured curriculum approach with integrated Triple Review methodology. Create a comprehensive day-by-day study schedule with the following requirements:

## Basic Parameters:
- Study Period: ${startDate} to ${testDate} (${totalDays} days)
- Daily Study Hours: ${dailyHours}
- Weekly Study Hours: ${weeklyHours}
- Study Intensity: ${intensityLevel}
- Focus Areas: ${selectedAreas.join(', ')}

**IMPORTANT: Logic Games are NO LONGER part of the LSAT as of August 2024. Focus only on Logical Reasoning and Reading Comprehension.**

## Curriculum Structure:

### Phase 1: LR Curriculum Foundation (Days 1-60)
Complete these lessons in order, 2-3 days per lesson, 1-2 hours daily:

**An Introduction to Logical Reasoning (2 lessons)**
1. Circuit Logic - The Origin Story
2. The Fundamentals of Argumentation

**Deductive Logic (4 lessons)**
3. Conditional Reasoning Explained
4. Conditional Reasoning Flashcards
5. Parts of an Argument
6. The Grammar of Arguments

**Circuits (5 lessons)**
7. Deductive Circuits
8. Assumptions and Flaws
9. Using Circuits to Answer LR Questions
10. Using Circuits: Deductive Structure Family
11. Using Circuits: Deductive Flaw Family

**Inductive Logic (2 lessons)**
12. Inductive Reasoning
13. The Bradford Hill Criteria

**Inductive Circuits (3 lessons)**
14. Causal Circuits
15. Using Circuits: Inductive Structure Family
16. Using Circuits: Inductive Flaw Family

**Using Circuits to Answer Inference Questions (4 lessons)**
17. The Principle of Charity
18. Inferences - Must be True
19. Most Strongly Supported
20. Resolving Paradoxes

### Phase 2: RC Curriculum (Begin after LR completion)
Complete these lessons in order, ~7 days per lesson, 1-2 hours daily:

21. Structure Is a Verb: How to Read Actively
22. Headlining: Shrinking the Passage Without Losing the Plot
23. The Macro Stimulus: Reading Comp as a Longform Argument
24. Spot the Blueprint: Mapping Passages to Stimulus Types

### Phase 3: Triple Review Integration (Begin after completing "Circuits" section)
Integrate Triple Review cycles throughout remaining study period using PrepTests 101-130:

**Triple Review Cycle (6 hours total per section):**
- Day 1: Timed section (1 hour)
- Day 2: Blind review (3 hours)
- Day 3: Strategy planning (2 hours)

**Section Rotation:** LR Section 1 → RC → LR Section 2, then move to next PrepTest

**Available PrepTests:** 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130

## Scheduling Rules:

1. **Phase Integration:** 
   - Start Triple Review after completing LR lesson 11 ("Using Circuits: Deductive Flaw Family")
   - Once RC curriculum begins, include both RC curriculum work and Triple Review on non-rest days
   - Prioritize completing Triple Review cycles (don't split 6-hour cycles across weeks)

2. **Daily Structure:**
   - Early Phase: LR curriculum only
   - Middle Phase: LR curriculum + Triple Review cycles
   - Later Phase: RC curriculum + Triple Review cycles
   - Final Phase: Triple Review focus with curriculum review

3. **Rest Days:** Include rest days (0 hours) every 7-10 days to prevent burnout

4. **Task Specificity:** Make each task specific and actionable with lesson names, PrepTest numbers, and section types

## Output Format:
Output ONLY a JSON array with objects in this exact format:

[
  {
    "date": "2025-08-12",
    "tasks": [
      "LR Curriculum: Circuit Logic - The Origin Story (Day 1/3)",
      "Total: LR Foundation Work"
    ],
    "estimatedHours": 2
  },
  {
    "date": "2025-08-15",
    "tasks": [
      "LR Curriculum: Using Circuits - Deductive Structure Family (Day 2/3)",
      "Triple Review: PT 101 LR Section 1 - Blind Review (3hrs)",
      "Total: Curriculum + Triple Review"
    ],
    "estimatedHours": 5
  },
  {
    "date": "2025-08-20",
    "tasks": [
      "RC Curriculum: Structure Is a Verb - How to Read Actively (Day 3/7)",
      "Triple Review: PT 103 RC - Timed Section (1hr)",
      "Total: RC Curriculum + Triple Review"
    ],
    "estimatedHours": 3
  },
  {
    "date": "2025-08-21",
    "tasks": ["Rest Day"],
    "estimatedHours": 0
  }
]
```

Ensure the schedule progresses logically through the curriculum while maintaining consistent Triple Review cycles and appropriate rest periods.`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let schedule;
      try {
        // First attempt: parse as-is
        schedule = JSON.parse(text);
      } catch (err1) {
        try {
          // Second attempt: extract JSON from markdown code block
          const extracted = extractJsonFromMarkdown(text);
          if (extracted) {
            schedule = JSON.parse(extracted);
          } else {
            // If no markdown block found, re-throw the original error
            throw err1;
          }
        } catch (err2) {
          // If extraction or parsing of extracted content fails
          throw new Error("Failed to parse AI response as JSON:\n" + text);
        }
      }
      
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Generate Study Schedule</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered LSAT prep planning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!showPreview ? (
          <div className="p-6 space-y-6">
            {/* Study Period */}
            <div className="space-y-4">
              <h3 className="flex items-center space-x-2 text-lg font-semibold text-slate-800 dark:text-white">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Study Period</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      validationErrors.startDate ? 'border-red-300' : 'border-gray-300'
                    } dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                  />
                  {validationErrors.startDate && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Test Date
                  </label>
                  <select
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      validationErrors.testDate ? 'border-red-300' : 'border-gray-300'
                    } dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                  >
                    <option value="">Select test date</option>
                    {upcomingTestDates.map(test => (
                      <option key={test.date} value={test.date}>{test.label}</option>
                    ))}
                    <option value="custom">Custom date...</option>
                  </select>
                  {validationErrors.testDate && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.testDate}
                    </p>
                  )}
                </div>
              </div>

              {validationErrors.dateRange && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {validationErrors.dateRange}
                  </p>
                </div>
              )}
            </div>

            {/* Study Intensity */}
            <div className="space-y-4">
              <h3 className="flex items-center space-x-2 text-lg font-semibold text-slate-800 dark:text-white">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Study Intensity</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(intensityPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setStudyIntensity(key);
                      setWeeklyHours(preset.hours);
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      studyIntensity === key
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-slate-800 dark:text-white">{preset.label}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{preset.description}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Weekly Study Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationErrors.weeklyHours ? 'border-red-300' : 'border-gray-300'
                  } dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                />
                {validationErrors.weeklyHours && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.weeklyHours}
                  </p>
                )}
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-4">
              <h3 className="flex items-center space-x-2 text-lg font-semibold text-slate-800 dark:text-white">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Focus Areas</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'readingComp', label: 'Reading Comprehension', icon: BookOpen, desc: 'Passage analysis' },
                  { key: 'logicalReasoning', label: 'Logical Reasoning', icon: Brain, desc: 'Argument evaluation' },
                  { key: 'writing', label: 'Writing Sample', icon: BookOpen, desc: 'Essay preparation' }
                ].map(area => (
                  <label key={area.key} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={focusAreas[area.key as keyof typeof focusAreas]}
                      onChange={(e) => setFocusAreas(prev => ({ ...prev, [area.key]: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <area.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-800 dark:text-white">{area.label}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{area.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <div className="space-x-3">
                <button
                  onClick={generatePreview}
                  disabled={Object.keys(validationErrors).length > 0}
                  className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                >
                  Preview Schedule
                </button>
                <button
                  onClick={generateSchedule}
                  disabled={Object.keys(validationErrors).length > 0 || loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Generate Schedule</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Preview */
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Schedule Preview</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-indigo-600">{preview.totalDays}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Study Days</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{preview.totalHours}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Hours</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{preview.weeklyHours}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Hours/Week</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{preview.focusAreas.length}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Focus Areas</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 dark:text-white mb-2">Study Plan Summary</h4>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <li>• {preview.intensity} study approach</li>
                  <li>• Focus on: {preview.focusAreas.join(', ')}</li>
                  <li>• Daily tasks with progressive difficulty</li>
                  <li>• Includes practice tests and rest days</li>
                  <li>• Note: Logic Games removed from LSAT as of August 2024</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                ← Back to Edit
              </button>
              <button
                onClick={generateSchedule}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create This Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateScheduleModal;
