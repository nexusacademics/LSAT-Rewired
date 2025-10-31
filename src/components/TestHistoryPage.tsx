import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { testHistoryService } from '../utils/testHistoryService';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Filter,
  Activity
} from 'lucide-react';

interface TestHistoryPageProps {
  onClose: () => void;
}

const TestHistoryPage: React.FC<TestHistoryPageProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'timed' | 'blind-review' | 'strategy-review'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadActivityData();
  }, [selectedPhase]);

  const loadActivityData = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (selectedPhase === 'all') {
        result = await testHistoryService.getAllActivity();
      } else {
        result = await testHistoryService.getActivityByPhase(selectedPhase);
      }

      if (result.error) {
        setError(result.error);
        setActivityData([]);
      } else {
        setActivityData(result.data || []);
      }
    } catch (err) {
      setError('Failed to load test history');
      setActivityData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getPhaseColor = (phase: string): 'primary' | 'info' | 'warning' | 'success' => {
    switch (phase) {
      case 'timed': return 'primary';
      case 'blind-review': return 'info';
      case 'strategy-review': return 'warning';
      default: return 'success';
    }
  };

  const getPhaseName = (phase: string) => {
    switch (phase) {
      case 'timed': return 'Timed';
      case 'blind-review': return 'Blind Review';
      case 'strategy-review': return 'Strategy Review';
      default: return phase;
    }
  };

  const backgroundClasses = theme === 'dark'
    ? 'bg-gray-900'
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';

  const renderActivityItem = (item: any) => {
    const isExpanded = expandedItems.has(item.session_id || item.id);
    const isTestCompletion = item.activity_type === 'test_completion';
    const itemId = item.session_id || item.id || `${item.test_id}-${item.completion_timestamp}`;

    return (
      <Card
        key={itemId}
        padding="default"
        hover
        className="mb-3"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleExpand(itemId)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {item.test_name}
              </h3>
              <Badge variant={getPhaseColor(item.phase)}>
                {getPhaseName(item.phase)}
              </Badge>
              {isTestCompletion && (
                <Badge variant="success">
                  Full Test Complete
                </Badge>
              )}
            </div>

            {!isTestCompletion && (
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {item.section_name}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {formatDate(item.completion_timestamp)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {isTestCompletion
                    ? `${item.questions_correct}/${item.total_questions} (${item.overall_accuracy.toFixed(1)}%)`
                    : `${item.questions_correct}/${item.questions_answered} (${item.accuracy_percentage.toFixed(1)}%)`
                  }
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {isTestCompletion
                    ? `${item.total_time_minutes} min`
                    : formatTime(item.total_time_seconds)
                  }
                </span>
              </div>
            </div>
          </div>

          <button className="ml-4">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-2 gap-4">
              {isTestCompletion ? (
                <>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Sections Completed
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.sections_completed}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Test Type
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.is_full_test ? 'Full Test' : 'Section'}
                    </p>
                  </div>
                  {item.time_mode && (
                    <div>
                      <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Time Mode
                      </p>
                      <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.time_mode}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Questions Answered
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.questions_answered} / {item.total_questions}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Average Time/Question
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(Math.round(item.average_time_per_question))}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Section Type
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.section_type}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Section Order
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Section {item.section_order}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className={`min-h-screen w-full transition-all duration-500 ${backgroundClasses}`}>
      <div className="w-full pt-10 px-4 pb-4">
        <div className="max-w-[1200px] mx-auto space-y-4">
          <Card padding="default" gradient={theme === 'light'}>
            <div className={`flex items-center justify-between ${theme === 'dark' ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 p-6 -m-6 rounded-2xl' : ''}`}>
              <div>
                <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${
                  theme === 'dark'
                    ? 'text-white'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent'
                }`}>
                  Test History
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  View all your test activity and performance
                </p>
              </div>
              <Button variant="secondary" onClick={onClose}>
                Back to Dashboard
              </Button>
            </div>
          </Card>

          <Card padding="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle icon={<Filter className="h-5 w-5 text-blue-500" />}>
                  Filter by Phase
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-gray-500" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {activityData.length} {activityData.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedPhase === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedPhase('all')}
                >
                  All Activity
                </Button>
                <Button
                  variant={selectedPhase === 'timed' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedPhase('timed')}
                >
                  Timed
                </Button>
                <Button
                  variant={selectedPhase === 'blind-review' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedPhase('blind-review')}
                >
                  Blind Review
                </Button>
                <Button
                  variant={selectedPhase === 'strategy-review' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedPhase('strategy-review')}
                >
                  Strategy Review
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading && (
            <Card padding="default">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            </Card>
          )}

          {error && (
            <Card padding="default">
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button variant="primary" onClick={loadActivityData}>
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {!loading && !error && activityData.length === 0 && (
            <Card padding="default">
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No test activity found
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  Complete a test section to see your history here
                </p>
              </div>
            </Card>
          )}

          {!loading && !error && activityData.length > 0 && (
            <div>
              {activityData.map(renderActivityItem)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestHistoryPage;
