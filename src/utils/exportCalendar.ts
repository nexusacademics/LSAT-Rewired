import { createEvents } from 'ics'; // if you want, though you aren't using it now

export function generateICS(events: typeof filteredEvents) {
  const pad = (num: number) => (num < 10 ? '0' + num : num);

  const toICSDate = (date: Date) => {
    return date.getUTCFullYear().toString() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) + 'T' +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) + 'Z';
  };

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YourApp//LSAT Study Schedule//EN'
  ];

  events.forEach(event => {
    const start = new Date(event.start);
    const end = new Date(start.getTime() + event.estimatedHours * 60 * 60 * 1000);

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${event.id}@yourapp.com`);
    icsLines.push(`DTSTAMP:${toICSDate(new Date())}`);
    icsLines.push(`DTSTART:${toICSDate(start)}`);
    icsLines.push(`DTEND:${toICSDate(end)}`);
    icsLines.push(`SUMMARY:${event.title}`);
    icsLines.push(`DESCRIPTION:Estimated Hours: ${event.estimatedHours}\\nDifficulty: ${event.difficulty}`);
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');

  return icsLines.join('\r\n');
}

export function exportScheduleAsICS(schedule: typeof filteredEvents) {
  const icsContent = generateICS(schedule);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lsat-study-schedule.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
