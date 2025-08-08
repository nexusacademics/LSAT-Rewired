// utils/exportCalendar.ts
import { createEvents } from 'ics';

export function generateICS(events: typeof filteredEvents) {
  const pad = (num: number) => (num < 10 ? '0' + num : num);

  // Convert JS Date to YYYYMMDDTHHMMSSZ format (UTC)
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
    // Let's assume each event lasts estimatedHours hours
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
