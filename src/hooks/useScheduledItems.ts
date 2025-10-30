import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ScheduledItem {
  id: string;
  user_schedule_id: string;
  scheduled_date: string;
  item_type: string;
  title: string;
  description: string;
  estimated_hours: number;
  completed_hours: number;
  status: string;
  preptest_number: number | null;
  section_type: string | null;
  section_number: number | null;
  curriculum_lesson_id: string | null;
  day_in_sequence: number;
  completion_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSchedule {
  id: string;
  user_id: string;
  schedule_option_id: string | null;
  is_custom_schedule: boolean;
  start_date: string;
  target_test_date: string;
  status: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

interface UseScheduledItemsReturn {
  scheduledItems: ScheduledItem[];
  userSchedule: UserSchedule | null;
  isLoading: boolean;
  error: string | null;
  refreshSchedule: () => Promise<void>;
  markItemComplete: (itemId: string) => Promise<void>;
  updateItemHours: (itemId: string, completedHours: number) => Promise<void>;
}

export function useScheduledItems(userId: string | undefined): UseScheduledItemsReturn {
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([]);
  const [userSchedule, setUserSchedule] = useState<UserSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);

      const { data: schedule, error: scheduleError } = await supabase
        .from('user_schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (scheduleError) {
        throw scheduleError;
      }

      setUserSchedule(schedule);

      if (!schedule) {
        setScheduledItems([]);
        setIsLoading(false);
        return;
      }

      const { data: items, error: itemsError } = await supabase
        .from('scheduled_items')
        .select('*')
        .eq('user_schedule_id', schedule.id)
        .order('scheduled_date', { ascending: true })
        .order('day_in_sequence', { ascending: true });

      if (itemsError) {
        throw itemsError;
      }

      setScheduledItems(items || []);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching schedule:', err);
      setError(err.message || 'Failed to load schedule');
      setIsLoading(false);
    }
  };

  const markItemComplete = async (itemId: string) => {
    try {
      const item = scheduledItems.find(i => i.id === itemId);
      if (!item) return;

      const isCompleting = item.status !== 'completed';

      const { error } = await supabase
        .from('scheduled_items')
        .update({
          status: isCompleting ? 'completed' : 'pending',
          completion_date: isCompleting ? new Date().toISOString() : null,
          completed_hours: isCompleting ? item.estimated_hours : 0
        })
        .eq('id', itemId);

      if (error) throw error;

      await fetchSchedule();
    } catch (err: any) {
      console.error('Error marking item complete:', err);
      setError(err.message || 'Failed to update item');
    }
  };

  const updateItemHours = async (itemId: string, completedHours: number) => {
    try {
      const item = scheduledItems.find(i => i.id === itemId);
      if (!item) return;

      const { error } = await supabase
        .from('scheduled_items')
        .update({
          completed_hours: completedHours,
          status: completedHours >= item.estimated_hours ? 'completed' : 'in_progress',
          completion_date: completedHours >= item.estimated_hours ? new Date().toISOString() : null
        })
        .eq('id', itemId);

      if (error) throw error;

      await fetchSchedule();
    } catch (err: any) {
      console.error('Error updating item hours:', err);
      setError(err.message || 'Failed to update hours');
    }
  };

  useEffect(() => {
    fetchSchedule();

    if (!userId) return;

    const channel = supabase
      .channel(`schedule_changes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_items',
          filter: `user_schedule_id=eq.${userSchedule?.id}`
        },
        () => {
          fetchSchedule();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userSchedule?.id]);

  return {
    scheduledItems,
    userSchedule,
    isLoading,
    error,
    refreshSchedule: fetchSchedule,
    markItemComplete,
    updateItemHours
  };
}
