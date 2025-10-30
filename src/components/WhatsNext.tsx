import React, { useEffect, useState } from 'react';
import { Calendar, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle } from './ui/Card';
import Badge from './ui/Badge';

interface ScheduledItem {
  id: string;
  scheduled_date: string;
  item_type: string;
  title: string;
  description: string;
  estimated_hours: number;
  status: string;
  preptest_number: number | null;
  section_type: string | null;
  section_number: number | null;
  day_in_sequence: number;
}

interface WhatsNextProps {
  userId: string;
  onNavigateToScheduleOptions?: () => void;
}

const WhatsNext: React.FC<WhatsNextProps> = ({ userId, onNavigateToScheduleOptions }) => {
  const [nextItem, setNextItem] = useState<ScheduledItem | null>(null);
  const [upcomingItems, setUpcomingItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSchedule, setHasActiveSchedule] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchNextScheduledItems();
  }, [userId]);

  const fetchNextScheduledItems = async () => {
    try {
      const { data: activeSchedule, error: scheduleError } = await supabase
        .from('user_schedules')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (scheduleError) {
        console.error('Error fetching active schedule:', scheduleError);
        setLoading(false);
        return;
      }

      if (!activeSchedule) {
        setHasActiveSchedule(false);
        setLoading(false);
        return;
      }

      setHasActiveSchedule(true);

      const today = new Date().toISOString().split('T')[0];

      const { data: items, error: itemsError } = await supabase
        .from('scheduled_items')
        .select('*')
        .eq('user_schedule_id', activeSchedule.id)
        .eq('status', 'pending')
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })
        .order('day_in_sequence', { ascending: true })
        .limit(4);

      if (itemsError) {
        console.error('Error fetching scheduled items:', itemsError);
        setLoading(false);
        return;
      }

      if (items && items.length > 0) {
        setNextItem(items[0]);
        setUpcomingItems(items.slice(1, 4));
      }

      setLoading(false);
    } catch (err) {
      console.error('Unexpected error fetching schedule:', err);
      setLoading(false);
    }
  };

  const handleMarkComplete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_items')
        .update({
          status: 'completed',
          completion_date: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('Error marking item complete:', error);
        return;
      }

      fetchNextScheduledItems();
    } catch (err) {
      console.error('Unexpected error marking complete:', err);
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    const labels: { [key: string]: string } = {
      'lr_curriculum': 'LR Curriculum',
      'rc_curriculum': 'RC Curriculum',
      'triple_review_timed': 'Triple Review - Timed',
      'triple_review_blind': 'Triple Review - Blind Review',
      'triple_review_strategy': 'Triple Review - Strategy Review',
      'full_practice_test': 'Full Practice Test',
      'full_practice_test_blind': 'Full PT - Blind Review',
      'full_practice_test_strategy': 'Full PT - Strategy Review',
      'rest_day': 'Rest Day'
    };
    return labels[itemType] || itemType;
  };

  const getItemTypeColor = (itemType: string) => {
    if (itemType.includes('lr_curriculum')) return 'info';
    if (itemType.includes('rc_curriculum')) return 'primary';
    if (itemType.includes('triple_review')) return 'warning';
    if (itemType.includes('full_practice_test')) return 'danger';
    if (itemType === 'rest_day') return 'secondary';
    return 'secondary';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];

    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === tomorrowOnly) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card padding="default" hover>
        <CardHeader className="pb-3">
          <CardTitle icon={<Calendar className="h-5 w-5 text-teal-500" />}>
            What's Next
          </CardTitle>
        </CardHeader>
        <div className="text-center py-8">
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading your schedule...
          </div>
        </div>
      </Card>
    );
  }

  if (!hasActiveSchedule) {
    return (
      <Card padding="default" hover>
        <CardHeader className="pb-3">
          <CardTitle icon={<Calendar className="h-5 w-5 text-teal-500" />}>
            What's Next
          </CardTitle>
        </CardHeader>
        <Card variant="accent" padding="sm">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No Active Study Schedule
            </h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Create a personalized study schedule to track your progress
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={onNavigateToScheduleOptions}
            >
              Create Schedule
            </Button>
          </div>
        </Card>
      </Card>
    );
  }

  if (!nextItem) {
    return (
      <Card padding="default" hover>
        <CardHeader className="pb-3">
          <CardTitle icon={<Calendar className="h-5 w-5 text-teal-500" />}>
            What's Next
          </CardTitle>
        </CardHeader>
        <Card variant="accent" padding="sm">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              All Caught Up!
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              You've completed all scheduled items. Great work!
            </p>
          </div>
        </Card>
      </Card>
    );
  }

  return (
    <Card padding="default" hover>
      <CardHeader className="pb-3">
        <CardTitle icon={<Calendar className="h-5 w-5 text-teal-500" />}>
          What's Next
        </CardTitle>
      </CardHeader>

      {/* Next Item - Featured */}
      <Card variant="accent" padding="sm" className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getItemTypeColor(nextItem.item_type)}>
                {getItemTypeLabel(nextItem.item_type)}
              </Badge>
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatDate(nextItem.scheduled_date)}
              </span>
            </div>
            <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {nextItem.title}
            </h3>
            {nextItem.description && (
              <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {nextItem.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs">
              {nextItem.preptest_number && (
                <span className={`flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-medium">PT {nextItem.preptest_number}</span>
                  {nextItem.section_type && ` - ${nextItem.section_type}${nextItem.section_number ? ` ${nextItem.section_number}` : ''}`}
                </span>
              )}
              <span className={`flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <Clock className="h-3 w-3 mr-1" />
                {nextItem.estimated_hours}h
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="default"
            className="flex-1"
            onClick={() => {}}
          >
            Start Session
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="secondary"
            size="default"
            onClick={() => handleMarkComplete(nextItem.id)}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Upcoming Items */}
      {upcomingItems.length > 0 && (
        <div className="space-y-2">
          <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Coming Up
          </h4>
          {upcomingItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                  : 'bg-white/50 border-gray-200 hover:bg-white'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getItemTypeColor(item.item_type)} className="text-xs">
                    {getItemTypeLabel(item.item_type)}
                  </Badge>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    {formatDate(item.scheduled_date)}
                  </span>
                </div>
                <h5 className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {item.title}
                </h5>
              </div>
              <div className={`text-xs ml-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                {item.estimated_hours}h
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default WhatsNext;
