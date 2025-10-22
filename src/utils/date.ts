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
