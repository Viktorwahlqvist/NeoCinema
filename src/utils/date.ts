export const days = [
  "Söndag",
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
];
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();

  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const dayName = isToday ? "Idag" : days[date.getDay()];

  return `${dayName} ${date.getDate()}/${date.getMonth() + 1}`;
}

export function getLimitedSortedDates(dateStrings: string[]) {
  const uniqueDates = Array.from(new Set(dateStrings));
  uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return uniqueDates.slice(0, 7);
}

export function formatScreeningTime(date: Date | string): string {
  const dateObj = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Stockholm' // Bra att vara specifik!
  };
  
  // Använder sv-SE locale för formatet YYYY-MM-DD HH:MM
  return dateObj.toLocaleString("sv-SE", options);
}
