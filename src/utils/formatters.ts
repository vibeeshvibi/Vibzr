export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function cleanTitle(title: string): string {
  return title.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
}

export function getQualityUrl(urls: string | { [key: string]: string }, quality = '320kbps'): string {
  if (typeof urls === 'string') return urls;
  return urls[quality] || urls['160kbps'] || urls['96kbps'] || Object.values(urls)[0] || '';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
