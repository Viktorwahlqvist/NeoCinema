export function formatScreeningTime(date: Date | string): string {
  const dateObj = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Stockholm' 
  };
  
  return dateObj.toLocaleString("sv-SE", options);
}