import React, { useState } from 'react';
import { TrendingUp, Target, Users, Calendar, Trophy, Brain, BarChart3 } from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';
import useTheme from '../components/ui/ThemeToggle';
// Mock User interface for demo
interface User {
  stats: {
    rank: number;
    circuitsCreated: number;
    averageAnalysisScore: number;
  };
}

interface PerformanceTrackerProps {
  user?: User;
  theme?: 'light' | 'dark';
}

const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({ 
  user = {
    stats: {
      rank: 24,
      circuitsCreated: 156,
      averageAnalysisScore: 85
    }
  },
  theme = 'light'
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

  // Theme classes
  const isDark = theme === 'dark';
  const themeClasses = {
    background: isDark ? 'bg-gray-900' : 'bg-white',
    cardBackground: isDark ? 'bg-gray-800' : 'bg-white',
    secondaryBackground: isDark ? 'bg-gray-700' : 'bg-slate-50',
    text: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-slate-600',
    textMuted: isDark ? 'text-gray-400' : 'text-slate-400',
    border: isDark ? 'border-gray-700' : 'border-slate-200',
    tabBackground: isDark ? 'bg-gray-700' : 'bg-slate-100',
    tabActive: isDark ? 'bg-gray-600 text-white' : 'bg-white text-slate-900',
    tabInactive: isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900',
    chartBackground: isDark ? 'bg-gray-700' : 'bg-slate-50',
    highlight: isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200',
    highlightText: isDark ? 'text-blue-300' : 'text-blue-900'
  };

  // Mock performance data
  const performanceData = {
    week: {
      circuitsCreated: 12,
      averageAnalysisScore: 88,
      testsCompleted: 3,
      rankChange: +5
    },
    month: {
      circuitsCreated: 47,
      averageAnalysisScore: 85,
      testsCompleted: 12,
      rankChange: +23
    },
    all: {
      circuitsCreated: 156,
      averageAnalysisScore: 82,
      testsCompleted: 45,
      rankChange: +67
    }
  };

  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', circuits: 847, analysisScore: 96, change: 0 },
    { rank: 2, name: 'Marcus Johnson', circuits: 792, analysisScore: 94, change: +1 },
    { rank: 3, name: 'Emily Rodriguez', circuits: 738, analysisScore: 93, change: -1 },
    { rank: 4, name: 'David Kim', circuits: 687, analysisScore: 91, change: +2 },
    { rank: 5, name: 'Lisa Wang', circuits: 645, analysisScore: 90, change: 0 },
    { rank: user.stats.rank, name: 'You', circuits: user.stats.circuitsCreated, analysisScore: user.stats.averageAnalysisScore, change: performanceData[timeframe].rankChange }
  ];

  const currentData = performanceData[timeframe];

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Performance Analytics</h1>
            <p className={`text-3xl font-bold ${themeClasses.text}`}>Track your circuit mastery and analysis quality</p>
          </div>

          <div className={`flex space-x-1 ${themeClasses.tabBackground} p-1 rounded-xl`}>
            {[
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: 'all', label: 'All Time' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeframe(key as typeof timeframe)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeframe === key 
                    ? `${themeClasses.tabActive} shadow-sm` 
                    : themeClasses.tabInactive
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`${themeClasses.cardBackground} rounded-2xl shadow-sm border ${themeClasses.border} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Circuits Created</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>{currentData.circuitsCreated}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+{Math.floor(currentData.circuitsCreated * 0.15)} from last period</span>
            </div>
          </div>

          <div className={`${themeClasses.cardBackground} rounded-2xl shadow-sm border ${themeClasses.border} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Analysis Score</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>{currentData.averageAnalysisScore}%</p>
              </div>
              <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-xl">
                <Brain className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+{Math.floor(currentData.averageAnalysisScore * 0.05)}% improvement</span>
            </div>
          </div>

          <div className={`${themeClasses.cardBackground} rounded-2xl shadow-sm border ${themeClasses.border} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Tests Completed</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>{currentData.testsCompleted}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Calendar className="h-4 w-4 text-blue-500 mr-1" />
              <span className={themeClasses.textSecondary}>Avg 3 per week</span>
            </div>
          </div>

          <div className={`${themeClasses.cardBackground} rounded-2xl shadow-sm border ${themeClasses.border} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Global Rank</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>#{user.stats.rank}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+{currentData.rankChange} positions</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress Chart */}
          <div className={`lg:col-span-2 ${themeClasses.cardBackground} rounded-2xl shadow-sm border ${themeClasses.border} p-6`}>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-6`}>Analysis Score Progression</h3>
            
            {/* Mock chart visualization */}
            <div className={`relative h-64 ${themeClasses.chartBackground} rounded-xl p-4`}>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between h-48">
                {[75, 78, 82, 85, 88, 91, 85].map((score, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-gradient-to-t from-teal-600 to-teal-400 rounded-t w-8 transition-all hover:from-teal-700 hover:to-teal-500"
                      style={{ height: `${(score / 100) * 180}px` }}
                    ></div>
                    <span className={`text-xs ${themeClasses.textSecondary} mt-2`}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="absolute top-4 right-4">
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  Current: <span className="font-semibold text-teal-600 dark:text-teal-400">{currentData.averageAnalysisScore}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className={`text-center p-4 ${themeClasses.secondaryBackground} rounded-xl`}>
                <div className={`text-lg font-semibold ${themeClasses.text}`}>92%</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Best Score</div>
              </div>
              <div className={`text-center p-4 ${themeClasses.secondaryBackground} rounded-xl`}>
                <div className={`text-lg font-semibold ${themeClasses.text}`}>7.8</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Avg per Day</div>
              </div>
              <div className={`text-center p-4 ${themeClasses.secondaryBackground} rounded-xl`}>
                <div className={`text-lg font-semibold ${themeClasses.text}`}>156</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Total Circuits</div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className={`${themeClasses.cardBackground} rounded-2xl shadow-sm border ${themeClasses.border} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Circuit Masters</h3>
              <Users className={`h-5 w-5 ${themeClasses.textMuted}`} />
            </div>

            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((player, index) => (
                <div 
                  key={player.rank}
                  className={`p-3 rounded-xl ${
                    player.name === 'You' 
                      ? `${themeClasses.highlight} border-2` 
                      : themeClasses.secondaryBackground
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center mr-3 ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-slate-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        player.name === 'You' ? 'bg-blue-500 text-white' :
                        'bg-slate-300 text-slate-600 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {player.rank}
                      </span>
                      <div>
                        <div className={`font-medium ${player.name === 'You' ? themeClasses.highlightText : themeClasses.text}`}>
                          {player.name}
                        </div>
                        <div className={`text-xs ${themeClasses.textSecondary}`}>
                          {player.circuits} circuits • {player.analysisScore}% avg
                        </div>
                      </div>
                    </div>
                    
                    {player.change !== 0 && (
                      <div className={`text-xs font-medium ${
                        player.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {player.change > 0 ? '+' : ''}{player.change}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {user.stats.rank > 5 && (
                <>
                  <div className={`text-center ${themeClasses.textMuted} py-2`}>
                    <span className="text-xs">...</span>
                  </div>
                  <div className={`p-3 rounded-xl ${themeClasses.highlight} border-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs font-bold flex items-center justify-center mr-3">
                          {user.stats.rank}
                        </span>
                        <div>
                          <div className={`font-medium ${themeClasses.highlightText}`}>You</div>
                          <div className={`text-xs ${themeClasses.textSecondary}`}>
                            {user.stats.circuitsCreated} circuits • {user.stats.averageAnalysisScore}% avg
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs font-medium text-green-600 dark:text-green-400">
                        +{currentData.rankChange}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className={`${themeClasses.cardBackground} rounded-2xl shadow-sm border ${themeClasses.border} p-6`}>
          <h3 className={`text-lg font-semibold ${themeClasses.text} mb-6`}>Circuit Quality Breakdown</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className={`font-medium ${themeClasses.text}`}>Argument Structure</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.textSecondary}`}>Premise Identification</span>
                  <span className={`text-sm font-medium ${themeClasses.text}`}>94%</span>
                </div>
                <div className={`w-full ${isDark ? 'bg-gray-600' : 'bg-slate-200'} rounded-full h-2`}>
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.textSecondary}`}>Conclusion Mapping</span>
                  <span className={`text-sm font-medium ${themeClasses.text}`}>87%</span>
                </div>
                <div className={`w-full ${isDark ? 'bg-gray-600' : 'bg-slate-200'} rounded-full h-2`}>
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.textSecondary}`}>Assumption Recognition</span>
                  <span className={`text-sm font-medium ${themeClasses.text}`}>76%</span>
                </div>
                <div className={`w-full ${isDark ? 'bg-gray-600' : 'bg-slate-200'} rounded-full h-2`}>
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className={`font-medium ${themeClasses.text}`}>Analysis Depth</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.textSecondary}`}>Complete Circuits</span>
                  <span className={`text-sm font-medium ${themeClasses.text}`}>89%</span>
                </div>
                <div className={`w-full ${isDark ? 'bg-gray-600' : 'bg-slate-200'} rounded-full h-2`}>
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.textSecondary}`}>Annotation Quality</span>
                  <span className={`text-sm font-medium ${themeClasses.text}`}>82%</span>
                </div>
                <div className={`w-full ${isDark ? 'bg-gray-600' : 'bg-slate-200'} rounded-full h-2`}>
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeClasses.textSecondary}`}>Time to Complete</span>
                  <span className={`text-sm font-medium ${themeClasses.text}`}>91%</span>
                </div>
                <div className={`w-full ${isDark ? 'bg-gray-600' : 'bg-slate-200'} rounded-full h-2`}>
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className={`font-medium ${themeClasses.text}`}>Improvement Areas</h4>
              <div className="space-y-3 text-sm">
                <div className={`p-3 ${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200'} border rounded-lg`}>
                  <div className={`font-medium ${isDark ? 'text-orange-300' : 'text-orange-800'} mb-1`}>Assumption Recognition</div>
                  <div className={isDark ? 'text-orange-200' : 'text-orange-700'}>Focus on identifying unstated premises in arguments</div>
                </div>
                
                <div className={`p-3 ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg`}>
                  <div className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'} mb-1`}>Complex Arguments</div>
                  <div className={isDark ? 'text-blue-200' : 'text-blue-700'}>Practice with multi-layered reasoning structures</div>
                </div>
                
                <div className={`p-3 ${isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg`}>
                  <div className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'} mb-1`}>Speed & Accuracy</div>
                  <div className={isDark ? 'text-green-200' : 'text-green-700'}>Great balance of thorough analysis and efficiency</div>
                </div>
              </div>
            </div>
          </div>
        </div>      
      </div>
    </div>
  );
};

export default PerformanceTracker;