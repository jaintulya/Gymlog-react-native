const pad = value => String(value).padStart(2, '0');

// Stores the device-local wall-clock time together with its UTC offset.
export const localTimestamp = (date = new Date()) => {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetMins = pad(Math.abs(offsetMinutes) % 60);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` +
    `${String(date.getMilliseconds()).padStart(3, '0')}${sign}${offsetHours}:${offsetMins}`;
};

export const parseDate = value => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
};

export const formatClockTime = value => {
  const date = parseDate(value);
  if (!date) return '—';

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const formatLongDate = value => {
  const date = parseDate(value);
  if (!date) return 'Unknown date';

  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatDuration = seconds => {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${remainingSeconds}s`;
};

export const getHistoryDateLabel = value => {
  const date = parseDate(value);
  if (!date) return 'Earlier';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysApart = Math.round((today - target) / 86400000);

  if (daysApart === 0) return 'Today';
  if (daysApart === 1) return 'Yesterday';
  return formatLongDate(date);
};

export const getRecordDate = record =>
  record?.startedAt || record?.completedAt || record?.date || null;
