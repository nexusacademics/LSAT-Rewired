import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, TrendingUp, BookOpen, Scale, Brain, Plus, Filter, Download, Settings, Sun, Moon, BarChart3 } from 'lucide-react';

// Mock FullCalendar replacement for demo
const MockCalendar = ({ events, view, onEventClick, onDateClick }) => {
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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() - 7);
              setCurrentDate(newDate);
            }}
            className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-600"
          >
            ← Prev
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-600"
          >
            Today
          </button>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() + 7);
              setCurrentDate(newDate);
            }}
            className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-600"
          >
            Next →
          </button>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
      </div>

      {/* Week View */}
      <div className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-slate-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={day} className="min-h-[120px]">
            <div className="p-2 text-center font-medium text-sm text-slate-600 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700">
              {day} {weekDates[index]?.getDate()}
            </div>
            <div className="p-2 space-y-1">
              {getEventsForDate(weekDates[index]).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  onClick={() => onEventClick?.(event)}
                  className={`p-2 rounded-md text-xs cursor-pointer transition-all hover:shadow-md ${
                    event.section === 'Fundamentals' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                    event.section === 'Practice' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    'bg-orange-100 text-orange-800 hover:bg-orange-200'
                  }`}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-75">{event.estimatedHours}h</span>
                    <div className="flex items-center space-x-1">
                      {event.completed && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                      <div className={`w-2 h-2 rounded-full ${
                        event.difficulty === 'Beginner' ? 'bg-green-400' :
                        event.difficulty === 'Intermediate' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudyScheduleBuilder = () => {
  const [currentView, setCurrentView] = useState('dayGridWeek');
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
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
    const transformedEvents = schedule.map((item, index) => ({
      id: String(Date.now() + index),
      title: item.topics.join(' & '),
      start: item.weekStart,
      section: item.section || 'Practice',
      topics: item.topics,
      estimatedHours: item.estimatedHours,
      completedHours: 0,
      difficulty: item.difficulty || 'Intermediate',
      completed: false,
      allDay: true
    }));
    setEvents(transformedEvents);
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
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">LSAT Study Planner</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Track your progress and stay on schedule</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Stats toggle */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
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
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Progress</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="mt-3 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Hours Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}<span className="text-sm text-slate-500">/{stats.totalPlanned}</span></p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Sessions Done</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completedEvents}<span className="text-sm text-slate-500">/{stats.totalEvents}</span></p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Weekly Average</p>
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
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setCurrentView('dayGridWeek')}
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                currentView === 'dayGridWeek'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Weekly
            </button>
            <button
              onClick={() => setCurrentView('listWeek')}
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                currentView === 'listWeek'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              List View
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
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
              <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
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
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Study Sessions</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        event.section === 'Fundamentals' ? 'bg-blue-500' :
                        event.section === 'Practice' ? 'bg-green-500' : 'bg-orange-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white">{event.title}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
                          <span>{new Date(event.start).toLocaleDateString()}</span>
                          <span>{event.estimatedHours} hours</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            event.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            event.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-800 dark:text-white">
                          {event.completedHours}/{event.estimatedHours}h
                        </div>
                        <div className="w-24 bg-gray-200 dark:bg-slate-600 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              event.completed ? 'bg-green-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min((event.completedHours / event.estimatedHours) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleEventClick(event)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          event.completed
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
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

        {/* Enhanced Modal Import */}
        {isModalOpen && (
          <EnhancedGenerateScheduleModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onScheduleGenerated={handleScheduleGenerated}
          />
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedEvent.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {new Date(selectedEvent.start).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="font-medium">{selectedEvent.completedHours}/{selectedEvent.estimatedHours} hours</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Hours Completed
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedEvent.estimatedHours}
                      value={selectedEvent.completedHours}
                      onChange={(e) => updateEventHours(selectedEvent.id, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    {selectedEvent.topics.map((topic, index) => (
                      <span key={index} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => toggleEventComplete(selectedEvent.id)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      selectedEvent.completed
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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
  );
};

// Import the enhanced modal component
const EnhancedGenerateScheduleModal = ({ isOpen, onClose, onScheduleGenerated }) => {
  // This would import the enhanced modal from the previous artifact
  // For demo purposes, using a simplified version
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Generate Schedule (Demo)</h3>
        <p className="text-slate-600 mb-6">This is a simplified demo. The full enhanced modal with all features is available in the previous artifact.</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600">Cancel</button>
          <button
            onClick={() => {
              // Generate demo schedule
              const demoSchedule = [
                {
                  weekStart: '2025-08-31',
                  topics: ['Advanced Logic Games'],
                  estimatedHours: 15,
                  section: 'Practice',
                  difficulty: 'Advanced'
                }
              ];
              onScheduleGenerated(demoSchedule);
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Generate Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyScheduleBuilder;