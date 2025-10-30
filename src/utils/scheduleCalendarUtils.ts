import { ScheduledItem } from '../hooks/useScheduledItems';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  section: string;
  topics: string[];
  estimatedHours: number;
  completedHours: number;
  difficulty: string;
  completed: boolean;
  itemType: string;
  description: string;
  preptestNumber: number | null;
  sectionType: string | null;
  sectionNumber: number | null;
}

export function transformScheduledItemToCalendarEvent(item: ScheduledItem): CalendarEvent {
  const section = getItemSection(item.item_type);
  const difficulty = getItemDifficulty(item.item_type);
  const topics = extractTopics(item);

  return {
    id: item.id,
    title: item.title,
    start: item.scheduled_date,
    section,
    topics,
    estimatedHours: item.estimated_hours,
    completedHours: item.completed_hours,
    difficulty,
    completed: item.status === 'completed',
    itemType: item.item_type,
    description: item.description || '',
    preptestNumber: item.preptest_number,
    sectionType: item.section_type,
    sectionNumber: item.section_number
  };
}

function getItemSection(itemType: string): string {
  if (itemType.includes('lr_curriculum')) return 'Fundamentals';
  if (itemType.includes('rc_curriculum')) return 'Fundamentals';
  if (itemType.includes('triple_review')) return 'Practice';
  if (itemType.includes('full_practice_test')) return 'Review';
  if (itemType === 'rest_day') return 'Rest';
  return 'Other';
}

function getItemDifficulty(itemType: string): string {
  if (itemType.includes('curriculum')) return 'Beginner';
  if (itemType.includes('triple_review')) return 'Intermediate';
  if (itemType.includes('full_practice_test')) return 'Advanced';
  if (itemType === 'rest_day') return 'Beginner';
  return 'Intermediate';
}

function extractTopics(item: ScheduledItem): string[] {
  const topics: string[] = [];

  if (item.item_type.includes('lr_curriculum')) {
    topics.push('Logical Reasoning');
  }
  if (item.item_type.includes('rc_curriculum')) {
    topics.push('Reading Comprehension');
  }
  if (item.item_type.includes('triple_review')) {
    topics.push('Triple Review');
    if (item.section_type) {
      topics.push(item.section_type);
    }
  }
  if (item.item_type.includes('full_practice_test')) {
    topics.push('Full Practice Test');
  }
  if (item.preptest_number) {
    topics.push(`PT ${item.preptest_number}`);
  }

  if (topics.length === 0) {
    topics.push(item.item_type.replace(/_/g, ' '));
  }

  return topics;
}

export function getItemTypeLabel(itemType: string): string {
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
}

export function getItemTypeColor(itemType: string): string {
  if (itemType.includes('lr_curriculum')) return 'info';
  if (itemType.includes('rc_curriculum')) return 'primary';
  if (itemType.includes('triple_review')) return 'warning';
  if (itemType.includes('full_practice_test')) return 'danger';
  if (itemType === 'rest_day') return 'secondary';
  return 'secondary';
}
