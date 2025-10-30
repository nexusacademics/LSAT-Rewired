import React, { useEffect, useState } from 'react';
import { Calendar, Clock, TrendingUp, CheckCircle, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle } from './ui/Card';
import Badge from './ui/Badge';

interface ScheduleOption {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  intensity_level: 'light' | 'moderate' | 'intensive';
  weekly_hours: number;
  focus_areas: string[];
  curriculum_structure: {
    phases: Array<{
      name: string;
      duration_weeks: number;
      focus: string;
    }>;
    weekly_structure: string;
    full_practice_tests: number;
    triple_review_sections: number;
  };
  is_active: boolean;
  display_order: number;
}

interface ScheduleOptionsProps {
  userId: string;
  onScheduleCreated?: () => void;
}

const ScheduleOptions: React.FC<ScheduleOptionsProps> = ({ userId, onScheduleCreated }) => {
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<ScheduleOption | null>(null);
  const [targetTestDate, setTargetTestDate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const backgroundClasses = theme === 'dark'
    ? 'bg-gray-900'
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';

  useEffect(() => {
    fetchScheduleOptions();
  }, []);

  const fetchScheduleOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_options')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setScheduleOptions(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching schedule options:', err);
      setError('Failed to load schedule options');
      setLoading(false);
    }
  };

  const getIntensityColor = (level: string) => {
    switch (level) {
      case 'intensive': return 'danger';
      case 'moderate': return 'warning';
      case 'light': return 'info';
      default: return 'secondary';
    }
  };

  const getIntensityIcon = (level: string) => {
    switch (level) {
      case 'intensive': return <Zap className="h-5 w-5" />;
      case 'moderate': return <Target className="h-5 w-5" />;
      case 'light': return <BookOpen className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const calculateEndDate = (option: ScheduleOption) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (option.duration_weeks * 7));
    return end.toISOString().split('T')[0];
  };

  const handleCreateSchedule = async () => {
    if (!selectedOption || !targetTestDate) {
      setError('Please select a schedule and target test date');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const { data: existingSchedule, error: checkError } = await supabase
        .from('user_schedules')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingSchedule) {
        setError('You already have an active schedule. Please complete or abandon it before creating a new one.');
        setCreating(false);
        return;
      }

      const { data: newSchedule, error: scheduleError } = await supabase
        .from('user_schedules')
        .insert({
          user_id: userId,
          schedule_option_id: selectedOption.id,
          is_custom_schedule: false,
          start_date: startDate,
          target_test_date: targetTestDate,
          status: 'active',
          progress_percentage: 0.00
        })
        .select()
        .single();

      if (scheduleError) {
        console.error('Schedule creation error:', scheduleError);
        throw scheduleError;
      }

      await generateScheduledItems(newSchedule.id, selectedOption);

      setCreating(false);
      if (onScheduleCreated) {
        onScheduleCreated();
      }
    } catch (err: any) {
      console.error('Error creating schedule:', err);
      const errorMessage = err?.message || err?.error_description || JSON.stringify(err);
      setError(`Failed to create schedule: ${errorMessage}`);
      setCreating(false);
    }
  };

  const generateScheduledItems = async (scheduleId: string, option: ScheduleOption) => {
    const items = [];
    const start = new Date(startDate);
    let currentDay = 0;

    const totalDays = option.duration_weeks * 7;
    const phases = option.curriculum_structure.phases;

    let currentPhaseIndex = 0;
    let daysInCurrentPhase = 0;
    const daysPerPhase = phases.map(p => p.duration_weeks * 7);

    for (let day = 0; day < totalDays; day++) {
      if (daysInCurrentPhase >= daysPerPhase[currentPhaseIndex] && currentPhaseIndex < phases.length - 1) {
        currentPhaseIndex++;
        daysInCurrentPhase = 0;
      }

      const itemDate = new Date(start);
      itemDate.setDate(itemDate.getDate() + day);

      const isRestDay = (day + 1) % 7 === 0;

      if (isRestDay) {
        items.push({
          user_schedule_id: scheduleId,
          scheduled_date: itemDate.toISOString().split('T')[0],
          item_type: 'rest_day',
          title: 'Rest Day',
          description: 'Take a break to consolidate learning and avoid burnout',
          estimated_hours: 0.0,
          status: 'pending',
          day_in_sequence: day + 1
        });
      } else {
        const phase = phases[currentPhaseIndex];
        let itemType = 'lr_curriculum';
        let title = 'LR Curriculum Lesson';
        let description = phase.focus;
        let estimatedHours = option.weekly_hours / 6;

        if (phase.name.includes('RC')) {
          itemType = 'rc_curriculum';
          title = 'RC Curriculum Lesson';
        } else if (phase.name.includes('Triple Review')) {
          itemType = 'triple_review_timed';
          title = 'Triple Review Session';
        } else if (phase.name.includes('Practice Test')) {
          itemType = 'full_practice_test';
          title = 'Full Practice Test';
          estimatedHours = 3.5;
        }

        const item: any = {
          user_schedule_id: scheduleId,
          scheduled_date: itemDate.toISOString().split('T')[0],
          item_type: itemType,
          title: title,
          description: description,
          estimated_hours: Math.round(estimatedHours * 10) / 10,
          status: 'pending',
          day_in_sequence: day + 1
        };

        // Don't include null fields - let DB use defaults
        items.push(item);
      }

      daysInCurrentPhase++;
    }

    console.log('Inserting', items.length, 'scheduled items');
    const { error: itemsError } = await supabase
      .from('scheduled_items')
      .insert(items);

    if (itemsError) {
      console.error('Items insertion error:', itemsError);
      throw itemsError;
    }

    const milestones = [];
    let dayCounter = 0;

    for (let i = 0; i < phases.length; i++) {
      dayCounter += daysPerPhase[i];
      const milestoneDate = new Date(start);
      milestoneDate.setDate(milestoneDate.getDate() + dayCounter);

      milestones.push({
        user_schedule_id: scheduleId,
        milestone_date: milestoneDate.toISOString().split('T')[0],
        title: `${phases[i].name} Complete`,
        description: `Completed phase: ${phases[i].focus}`,
        milestone_type: 'phase_complete'
      });
    }

    const halfwayDay = Math.floor(totalDays / 2);
    const halfwayDate = new Date(start);
    halfwayDate.setDate(halfwayDate.getDate() + halfwayDay);

    milestones.push({
      user_schedule_id: scheduleId,
      milestone_date: halfwayDate.toISOString().split('T')[0],
      title: 'Halfway Point',
      description: 'You\'re halfway through your study plan!',
      milestone_type: 'halfway_point'
    });

    const finalWeekDate = new Date(start);
    finalWeekDate.setDate(finalWeekDate.getDate() + totalDays - 7);

    milestones.push({
      user_schedule_id: scheduleId,
      milestone_date: finalWeekDate.toISOString().split('T')[0],
      title: 'Final Week',
      description: 'Last week before test day - focus on review',
      milestone_type: 'final_week'
    });

    console.log('Inserting', milestones.length, 'milestones');
    const { error: milestonesError } = await supabase
      .from('schedule_milestones')
      .insert(milestones);

    if (milestonesError) {
      console.error('Milestones insertion error:', milestonesError);
      throw milestonesError;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen w-full transition-all duration-500 ${backgroundClasses}`}>
        <div className="w-full pt-10 px-4 pb-4">
          <div className="max-w-[1600px] mx-auto">
            <div className="text-center py-12">
              <div className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading schedule options...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-all duration-500 ${backgroundClasses}`}>
      <div className="w-full pt-10 px-4 pb-4">
        <div className="max-w-[1600px] mx-auto space-y-6">

          {/* Page Header */}
          <Card padding="default" gradient={theme === 'light'}>
            <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 p-6 -m-6 rounded-2xl' : ''}`}>
              <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${
                theme === 'dark'
                  ? 'text-white'
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent'
              }`}>
                Choose Your Study Schedule
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Select a preset schedule that matches your timeline and commitment level
              </p>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <Card variant="accent" padding="default">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </Card>
          )}

          {/* Schedule Options Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {scheduleOptions.map((option) => (
              <Card
                key={option.id}
                padding="default"
                hover
                className={`cursor-pointer transition-all duration-300 ${
                  selectedOption?.id === option.id
                    ? theme === 'dark'
                      ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                      : 'border-blue-400 shadow-lg shadow-blue-200'
                    : ''
                }`}
                onClick={() => setSelectedOption(option)}
              >
                <div className="relative">
                  {selectedOption?.id === option.id && (
                    <div className="absolute top-0 right-0">
                      <CheckCircle className="h-8 w-8 text-blue-500" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {getIntensityIcon(option.intensity_level)}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {option.name}
                      </h3>
                      <Badge variant={getIntensityColor(option.intensity_level)} className="mt-1">
                        {option.intensity_level.charAt(0).toUpperCase() + option.intensity_level.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {option.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Duration
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {option.duration_weeks} weeks
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Weekly Hours
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {option.weekly_hours} hours/week
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Full Practice Tests
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {option.curriculum_structure.full_practice_tests}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Triple Review Sessions
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {option.curriculum_structure.triple_review_sections}
                      </span>
                    </div>
                  </div>

                  {/* Phases */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Study Phases
                    </h4>
                    <div className="space-y-2">
                      {option.curriculum_structure.phases.map((phase, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className={`mt-1 h-2 w-2 rounded-full ${
                            theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {phase.name} ({phase.duration_weeks} weeks)
                            </div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                              {phase.focus}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Configuration Section */}
          {selectedOption && (
            <Card padding="default">
              <CardHeader>
                <CardTitle icon={<Calendar className="h-5 w-5 text-teal-500" />}>
                  Configure Your Schedule
                </CardTitle>
              </CardHeader>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    Recommended end date: {calculateEndDate(selectedOption)}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Target Test Date
                  </label>
                  <input
                    type="date"
                    value={targetTestDate}
                    onChange={(e) => setTargetTestDate(e.target.value)}
                    min={calculateEndDate(selectedOption)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    Your official LSAT test date
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCreateSchedule}
                  disabled={creating || !targetTestDate}
                  className="flex items-center"
                >
                  {creating ? 'Creating Schedule...' : 'Create Schedule'}
                  {!creating && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleOptions;
