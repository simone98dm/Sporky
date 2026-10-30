// Cryptographically secure random hex string (Web Crypto, works in browser and Node).
export const generateRandomString = (length: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
};

// Seconds → "m:ss".
export const formatTime = (seconds: number): string => {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Active state for a NAV_ITEMS entry: prefix match when set, exact otherwise.
export const isActiveNav = (
  item: { to: string; match: string | null },
  path: string,
): boolean => (item.match ? path.startsWith(item.match) : path === item.to);
