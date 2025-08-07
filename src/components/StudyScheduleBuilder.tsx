import React, { useState, useEffect, createContext, useContext } from 'react';
import { Calendar, Clock, Target, TrendingUp, BookOpen, Scale, Brain, Plus, Filter, Download, Settings, Sun, Moon, BarChart3, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// Theme Context
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// ThemeProvider Component
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  useEffect(() => {
    // Apply theme class to document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Generate Schedule Modal Component
const GenerateScheduleModal = ({ isOpen, onClose, onScheduleGenerated }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [testDate, setTestDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('12');
  const [studyIntensity, setStudyIntensity] = useState('moderate');
  const [focusAreas, setFocusAreas] = useState({
    logicGames: true,
    readingComp: true,
    logicalReasoning: true,
    writing: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState(null);

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
  }, [testDate, startDate, weeklyHours]);

  const validateForm = () => {
    const errors = {};
    
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
    const totalHours = studyWeeks * parseInt(weeklyHours);
    const selectedAreas = Object.entries(focusAreas).filter(([_, selected]) => selected).map(([area, _]) => area);
    
    setPreview({
      studyWeeks,
      totalHours,
      weeklyHours: parseInt(weeklyHours),
      focusAreas: selectedAreas,
      intensity: intensityPresets[studyIntensity].label
    });
    setShowPreview(true);
  };

  const generateSchedule = async () => {
    if (Object.keys(validationErrors).length > 0) return;
    
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const studyWeeks = Math.floor((new Date(testDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7));
      const selectedAreas = Object.entries(focusAreas).filter(([_, selected]) => selected).map(([area, _]) => area);
      
      const schedule = [];
      for (let i = 0; i < studyWeeks; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        
        const topics = [];
        if (selectedAreas.includes('logicGames')) topics.push('Logic Games');
        if (selectedAreas.includes('readingComp')) topics.push('Reading Comprehension');
        if (selectedAreas.includes('logicalReasoning')) topics.push('Logical Reasoning');
        if (selectedAreas.includes('writing')) topics.push('Writing Sample');
        
        schedule.push({
          id: String(Date.now() + i),
          weekStart: weekStart.toISOString().split('T')[0],
          title: topics.slice(0, 2).join(' & '),
          start: weekStart.toISOString().split('T')[0],
          topics: topics.slice(0, 2),
          estimatedHours: parseInt(weeklyHours),
          completedHours: 0,
          section: i < studyWeeks * 0.4 ? 'Fundamentals' : i < studyWeeks * 0.8 ? 'Practice' : 'Review',
          difficulty: i < studyWeeks * 0.3 ? 'Beginner' : i < studyWeeks * 0.7 ? 'Intermediate' : 'Advanced',
          completed: false
        });
      }
      
      onScheduleGenerated(schedule);
      onClose();
    } catch (err) {
      console.error('Error generating schedule:', err);
      setError('Something went wrong. Please check your inputs or try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'
            }`}>
              <Brain className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Generate Study Schedule
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                AI-powered LSAT prep planning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!showPreview ? (
          <div className="p-6 space-y-6">
            {/* Study Period */}
            <div className="space-y-4">
              <h3 className={`flex items-center space-x-2 text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Study Period</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      validationErrors.startDate ? 'border-red-300' : isDarkMode ? 'border-slate-600' : 'border-gray-300'
                    } ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'}`}
                  />
                  {validationErrors.startDate && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Test Date
                  </label>
                  <select
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      validationErrors.testDate ? 'border-red-300' : isDarkMode ? 'border-slate-600' : 'border-gray-300'
                    } ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'}`}
                  >
                    <option value="">Select test date</option>
                    {upcomingTestDates.map(test => (
                      <option key={test.date} value={test.date}>{test.label}</option>
                    ))}
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
                <div className={`p-3 border rounded-lg ${
                  isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className={`text-sm flex items-center ${
                    isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
                  }`}>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {validationErrors.dateRange}
                  </p>
                </div>
              )}
            </div>

            {/* Study Intensity */}
            <div className="space-y-4">
              <h3 className={`flex items-center space-x-2 text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>
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
                        ? isDarkMode 
                          ? 'border-indigo-500 bg-indigo-900/20'
                          : 'border-indigo-500 bg-indigo-50'
                        : isDarkMode
                          ? 'border-slate-600 hover:border-slate-500'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {preset.label}
                    </div>
                    <div className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Weekly Study Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationErrors.weeklyHours ? 'border-red-300' : isDarkMode ? 'border-slate-600' : 'border-gray-300'
                  } ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'}`}
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
              <h3 className={`flex items-center space-x-2 text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Focus Areas</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'logicGames', label: 'Logic Games', icon: Scale, desc: 'Analytical reasoning' },
                  { key: 'readingComp', label: 'Reading Comprehension', icon: BookOpen, desc: 'Passage analysis' },
                  { key: 'logicalReasoning', label: 'Logical Reasoning', icon: Brain, desc: 'Argument evaluation' },
                  { key: 'writing', label: 'Writing Sample', icon: BookOpen, desc: 'Essay preparation' }
                ].map(area => (
                  <label key={area.key} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                    isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={focusAreas[area.key]}
                      onChange={(e) => setFocusAreas(prev => ({ ...prev, [area.key]: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <area.icon className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {area.label}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {area.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className={`p-4 border rounded-lg ${
                isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm flex items-center ${
                  isDarkMode ? 'text-red-200' : 'text-red-800'
                }`}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className={`flex justify-between pt-4 border-t ${
              isDarkMode ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <button
                onClick={onClose}
                className={`px-4 py-2 font-medium ${
                  isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Cancel
              </button>
              <div className="space-x-3">
                <button
                  onClick={generatePreview}
                  disabled={Object.keys(validationErrors).length > 0}
                  className={`px-4 py-2 rounded-lg disabled:opacity-50 ${
                    isDarkMode 
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
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
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Schedule Preview
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-lg text-center ${
                  isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'
                }`}>
                  <div className="text-2xl font-bold text-indigo-600">{preview.studyWeeks}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Study Weeks</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${
                  isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
                }`}>
                  <div className="text-2xl font-bold text-green-600">{preview.totalHours}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Hours</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <div className="text-2xl font-bold text-blue-600">{preview.weeklyHours}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Hours/Week</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${
                  isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'
                }`}>
                  <div className="text-2xl font-bold text-purple-600">{preview.focusAreas.length}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Focus Areas</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Study Plan Summary
                </h4>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li>• {preview.intensity} study approach</li>
                  <li>• Focus on: {preview.focusAreas.join(', ')}</li>
                  <li>• Progressive difficulty from fundamentals to advanced practice</li>
                  <li>• Includes practice tests and review sessions</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setShowPreview(false)}
                className={`px-4 py-2 font-medium ${
                  isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'
                }`}
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

// Mock Calendar Component
const MockCalendar = ({ events, view, onEventClick, onDateClick }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getWeekDates = (date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return events.filter(event => event.start === dateStr);
  };

  const weekDates = getWeekDates(currentDate);

  return (
    <div className={`rounded-xl border overflow-hidden ${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      {/* Calendar Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() - 7);
              setCurrentDate(newDate);
            }}
            className={`px-3 py-1 text-sm border rounded transition-colors ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200'
                : 'bg-white border-gray-300 hover:bg-gray-50 text-slate-700'
            }`}
          >
            ← Prev
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className={`px-3 py-1 text-sm border rounded transition-colors ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200'
                : 'bg-white border-gray-300 hover:bg-gray-50 text-slate-700'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() + 7);
              setCurrentDate(newDate);
            }}
            className={`px-3 py-1 text-sm border rounded transition-colors ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200'
                : 'bg-white border-gray-300 hover:bg-gray-50 text-slate-700'
            }`}
          >
            Next →
          </button>
        </div>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
      </div>

      {/* Week View */}
      <div className={`grid grid-cols-7 ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'} divide-x`}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={day} className="min-h-[120px]">
            <div className={`p-2 text-center font-medium text-sm border-b ${
              isDarkMode 
                ? 'text-slate-300 border-slate-700 bg-slate-800'
                : 'text-slate-600 border-gray-200 bg-gray-50'
            }`}>
              {day} {weekDates[index]?.getDate()}
            </div>
            <div className={`p-2 space-y-1 min-h-[88px] ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              {getEventsForDate(weekDates[index]).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  onClick={() => onEventClick?.(event)}
                  className={`p-2 rounded-md text-xs cursor-pointer transition-all hover:shadow-md ${
                    event.section === 'Fundamentals' 
                      ? isDarkMode 
                        ? 'bg-blue-900/40 text-blue-200 hover:bg-blue-900/60 border border-blue-800' 
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200'
                      : event.section === 'Practice' 
                      ? isDarkMode 
                        ? 'bg-green-900/40 text-green-200 hover:bg-green-900/60 border border-green-800'
                        : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                      : isDarkMode 
                        ? 'bg-orange-900/40 text-orange-200 hover:bg-orange-900/60 border border-orange-800'
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-200'
                  }`}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-75">{event.estimatedHours}h</span>
                    <div className="flex items-center space-x-1">
                      {event.completed && <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>}
                      <div className={`w-2 h-2 rounded-full ${
                        event.difficulty === 'Beginner' ? 'bg-green-400' :
                        event.difficulty === 'Intermediate' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Empty state for days with no events */}
              {getEventsForDate(weekDates[index]).length === 0 && (
                <div className={`p-2 text-xs text-center opacity-50 ${
                  isDarkMode ? 'text-slate-500' : 'text-gray-400'
                }`}>
                  No sessions
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Study Schedule Builder Component
const StudyScheduleBuilder = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [currentView, setCurrentView] = useState('dayGridWeek');
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [filter, setFilter] = useState('all');

  // Sample events for demo
  useEffect(() => {
    const sampleEvents = [
      {
        id: '1',
        title: 'Logic Games Fundamentals',
        start: '2025-08-10',
        section: 'Fundamentals',
        topics: ['Logic Games', 'Basic Diagrams'],
        estimatedHours: 8,
        completedHours: 8,
        difficulty: 'Beginner',
        completed: true
      },
      {
        id: '2',
        title: 'Reading Comprehension',
        start: '2025-08-17',
        section: 'Fundamentals',
        topics: ['Reading Comp', 'Main Point Questions'],
        estimatedHours: 10,
        completedHours: 6,
        difficulty: 'Beginner',
        completed: false
      },
      {
        id: '3',
        title: 'Logical Reasoning Practice',
        start: '2025-08-24',
        section: 'Practice',
        topics: ['Logical Reasoning', 'Assumption Questions'],
        estimatedHours: 12,
        completedHours: 0,
        difficulty: 'Intermediate',
        completed: false
      }
    ];
    setEvents(sampleEvents);
  }, []);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalPlanned = events.reduce((sum, event) => sum + event.estimatedHours, 0);
    const totalCompleted = events.reduce((sum, event) => sum + (event.completedHours || 0), 0);
    const completedEvents = events.filter(event => event.completed).length;
    const weeklyAverage = totalPlanned > 0 ? totalPlanned / Math.max(events.length, 1) : 0;

    return {
      totalPlanned,
      totalCompleted,
      completedEvents,
      totalEvents: events.length,
      completionRate: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0,
      weeklyAverage: Math.round(weeklyAverage)
    };
  }, [events]);

  const handleScheduleGenerated = (schedule) => {
    setEvents(schedule);
    setIsModalOpen(false);
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'completed') return event.completed;
    if (filter === 'pending') return !event.completed;
    return event.section.toLowerCase() === filter;
  });

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const toggleEventComplete = (eventId) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, completed: !event.completed, completedHours: !event.completed ? event.estimatedHours : 0 }
        : event
    ));
    setSelectedEvent(null);
  };

  const updateEventHours = (eventId, completedHours) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, completedHours, completed: completedHours >= event.estimatedHours }
        : event
    ));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark:bg-slate-900 bg-slate-900' : 'bg-gray-50'}`}>
      <div className="w-full pt-10 px-4 pb-4">
        <div className="max-w-[1600px] mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                LSAT Study Planner
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Track your progress and stay on schedule
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-700'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              {/* Stats toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </button>
              
              {/* Generate schedule button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Schedule</span>
              </button>
            </div>
          </div>

          {/* Statistics Dashboard */}
          {showStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Progress</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-indigo-600" />
                </div>
                <div className={`mt-3 rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Hours Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.totalCompleted}
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        /{stats.totalPlanned}
                      </span>
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sessions Done</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.completedEvents}
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        /{stats.totalEvents}
                      </span>
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Weekly Average</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.weeklyAverage}h</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            {/* View Toggle */}
            <div className={`flex items-center space-x-2 p-1 rounded-lg border ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => setCurrentView('dayGridWeek')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  currentView === 'dayGridWeek'
                    ? isDarkMode 
                      ? 'bg-indigo-900 text-indigo-300'
                      : 'bg-indigo-100 text-indigo-700'
                    : isDarkMode 
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Weekly
              </button>
              <button
                onClick={() => setCurrentView('listWeek')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  currentView === 'listWeek'
                    ? isDarkMode 
                      ? 'bg-indigo-900 text-indigo-300'
                      : 'bg-indigo-100 text-indigo-700'
                    : isDarkMode 
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                List View
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white border-gray-200 text-slate-800'
                  }`}
                >
                  <option value="all">All Sessions</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="fundamentals">Fundamentals</option>
                  <option value="practice">Practice</option>
                  <option value="review">Review</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button className={`p-2 transition-colors ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
                  <Download className="w-4 h-4" />
                </button>
                <button className={`p-2 transition-colors ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar */}
          {currentView === 'dayGridWeek' ? (
            <MockCalendar 
              events={filteredEvents}
              view={currentView}
              onEventClick={handleEventClick}
            />
          ) : (
            /* List View */
            <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Study Sessions</h3>
              </div>
              <div className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                {filteredEvents.map((event) => (
                  <div key={event.id} className={`p-6 transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${
                          event.section === 'Fundamentals' ? 'bg-blue-500' :
                          event.section === 'Practice' ? 'bg-green-500' : 'bg-orange-500'
                        }`}></div>
                        <div>
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{event.title}</h4>
                          <div className={`flex items-center space-x-4 mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <span>{new Date(event.start).toLocaleDateString()}</span>
                            <span>{event.estimatedHours} hours</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              event.difficulty === 'Beginner' 
                                ? isDarkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-800'
                                : event.difficulty === 'Intermediate' 
                                ? isDarkMode ? 'bg-yellow-900/30 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                                : isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'
                            }`}>
                              {event.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {event.completedHours}/{event.estimatedHours}h
                          </div>
                          <div className={`w-24 rounded-full h-2 mt-1 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                event.completed 
                                  ? isDarkMode ? 'bg-green-400' : 'bg-green-500'
                                  : isDarkMode ? 'bg-indigo-400' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${Math.min((event.completedHours / event.estimatedHours) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleEventClick(event)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            event.completed
                              ? isDarkMode 
                                ? 'bg-green-900/30 text-green-200 hover:bg-green-900/50'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                              : isDarkMode 
                                ? 'bg-indigo-900/30 text-indigo-200 hover:bg-indigo-900/50'
                                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                          }`}
                        >
                          {event.completed ? 'Completed' : 'Mark Done'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Schedule Modal */}
          {isModalOpen && (
            <GenerateScheduleModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onScheduleGenerated={handleScheduleGenerated}
            />
          )}

          {/* Event Detail Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className={`rounded-2xl shadow-2xl max-w-md w-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {selectedEvent.title}
                      </h3>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {new Date(selectedEvent.start).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className={`${isDarkMode ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Progress</span>
                      <span className="font-medium">{selectedEvent.completedHours}/{selectedEvent.estimatedHours} hours</span>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Hours Completed
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={selectedEvent.estimatedHours}
                        value={selectedEvent.completedHours}
                        onChange={(e) => updateEventHours(selectedEvent.id, parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                          isDarkMode 
                            ? 'border-slate-600 bg-slate-700 text-white'
                            : 'border-gray-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      {selectedEvent.topics.map((topic, index) => (
                        <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                          isDarkMode 
                            ? 'bg-indigo-900 text-indigo-200'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`flex justify-end space-x-3 mt-6 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className={`px-4 py-2 ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                      Close
                    </button>
                    <button
                      onClick={() => toggleEventComplete(selectedEvent.id)}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        selectedEvent.completed
                          ? isDarkMode 
                            ? 'bg-slate-600 text-slate-200 hover:bg-slate-500'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {selectedEvent.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component with Theme Provider
const App = () => {
  return (
    <ThemeProvider>
      <StudyScheduleBuilder />
    </ThemeProvider>
  );
};

export default App;