import React, { useState } from 'react';
import { TrendingUp, Target, Users, Calendar, Trophy, Brain, BarChart3 } from 'lucide-react';
import { User } from '../App';

interface PerformanceTrackerProps {
  user: User;
}

const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({ user }) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
          <p className="text-slate-600 mt-2">Track your circuit mastery and analysis quality</p>
        </div>

        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
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
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Circuits Created</p>
              <p className="text-2xl font-bold text-slate-900">{currentData.circuitsCreated}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+{Math.floor(currentData.circuitsCreated * 0.15)} from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Analysis Score</p>
              <p className="text-2xl font-bold text-slate-900">{currentData.averageAnalysisScore}%</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-xl">
              <Brain className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+{Math.floor(currentData.averageAnalysisScore * 0.05)}% improvement</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Tests Completed</p>
              <p className="text-2xl font-bold text-slate-900">{currentData.testsCompleted}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Calendar className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-slate-600">Avg 3 per week</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Global Rank</p>
              <p className="text-2xl font-bold text-slate-900">#{user.stats.rank}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+{currentData.rankChange} positions</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Analysis Score Progression</h3>
          
          {/* Mock chart visualization */}
          <div className="relative h-64 bg-slate-50 rounded-xl p-4">
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between h-48">
              {[75, 78, 82, 85, 88, 91, 85].map((score, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-gradient-to-t from-teal-600 to-teal-400 rounded-t w-8 transition-all hover:from-teal-700 hover:to-teal-500"
                    style={{ height: `${(score / 100) * 180}px` }}
                  ></div>
                  <span className="text-xs text-slate-600 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="absolute top-4 right-4">
              <div className="text-sm text-slate-600">
                Current: <span className="font-semibold text-teal-600">{currentData.averageAnalysisScore}%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-lg font-semibold text-slate-900">92%</div>
              <div className="text-sm text-slate-600">Best Score</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-lg font-semibold text-slate-900">7.8</div>
              <div className="text-sm text-slate-600">Avg per Day</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-lg font-semibold text-slate-900">156</div>
              <div className="text-sm text-slate-600">Total Circuits</div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Circuit Masters</h3>
            <Users className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((player, index) => (
              <div 
                key={player.rank}
                className={`p-3 rounded-xl ${
                  player.name === 'You' 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center mr-3 ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-slate-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      player.name === 'You' ? 'bg-blue-500 text-white' :
                      'bg-slate-300 text-slate-600'
                    }`}>
                      {player.rank}
                    </span>
                    <div>
                      <div className={`font-medium ${player.name === 'You' ? 'text-blue-900' : 'text-slate-900'}`}>
                        {player.name}
                      </div>
                      <div className="text-xs text-slate-600">
                        {player.circuits} circuits • {player.analysisScore}% avg
                      </div>
                    </div>
                  </div>
                  
                  {player.change !== 0 && (
                    <div className={`text-xs font-medium ${
                      player.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {player.change > 0 ? '+' : ''}{player.change}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {user.stats.rank > 5 && (
              <>
                <div className="text-center text-slate-400 py-2">
                  <span className="text-xs">...</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs font-bold flex items-center justify-center mr-3">
                        {user.stats.rank}
                      </span>
                      <div>
                        <div className="font-medium text-blue-900">You</div>
                        <div className="text-xs text-slate-600">
                          {user.stats.circuitsCreated} circuits • {user.stats.averageAnalysisScore}% avg
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs font-medium text-green-600">
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Circuit Quality Breakdown</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Argument Structure</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Premise Identification</span>
                <span className="text-sm font-medium text-slate-900">94%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Conclusion Mapping</span>
                <span className="text-sm font-medium text-slate-900">87%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Assumption Recognition</span>
                <span className="text-sm font-medium text-slate-900">76%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Analysis Depth</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Complete Circuits</span>
                <span className="text-sm font-medium text-slate-900">89%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Annotation Quality</span>
                <span className="text-sm font-medium text-slate-900">82%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Time to Complete</span>
                <span className="text-sm font-medium text-slate-900">91%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Improvement Areas</h4>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-medium text-orange-800 mb-1">Assumption Recognition</div>
                <div className="text-orange-700">Focus on identifying unstated premises in arguments</div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-800 mb-1">Complex Arguments</div>
                <div className="text-blue-700">Practice with multi-layered reasoning structures</div>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800 mb-1">Speed & Accuracy</div>
                <div className="text-green-700">Great balance of thorough analysis and efficiency</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracker;