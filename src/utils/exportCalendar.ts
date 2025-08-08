// utils/exportCalendar.ts
import { createEvents } from 'ics';

export function exportScheduleAsICS(events: any[]) {
  const icsEvents = events.map(event => ({
    title: event.title || 'Study Session',
    start: formatToICSDateTime(event.start),
    end: formatToICSDateTime(event.end),
    description: event.description || '',
  }));

  createEvents(icsEvents, (error, value) => {
    if (error) {
      console.error(error);
      return;
    }

    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'study_schedule.ics';
    a.click();
    URL.revokeObjectURL(url);
  });
}

function formatToICSDateTime(dateStr: string | Date): [number, number, number, number, number] {
  const date = new Date(dateStr);
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
}
