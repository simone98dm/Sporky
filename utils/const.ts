// Cookie names
export const COOKIE_NAME = 'sporky_access_token';
export const OAUTH_STATE_COOKIE = 'spotify_oauth_state';

// Spotify API endpoints
export const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
export const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com';

// Time ranges for Spotify API
export const TIME_RANGES = {
  SHORT_TERM: 'short_term',
  MEDIUM_TERM: 'medium_term',
  LONG_TERM: 'long_term',
} as const;

// Pill options for the time-period selector (Stitch design)
export const TIME_RANGE_OPTIONS = [
  { value: TIME_RANGES.SHORT_TERM, label: 'Last 4 Weeks', short: '4 Weeks' },
  { value: TIME_RANGES.MEDIUM_TERM, label: 'Last 6 Months', short: '6 Months' },
  {
    value: TIME_RANGES.LONG_TERM,
    label: 'Last 12 Months',
    short: '12 Months',
  },
] as const;

// Range each time range is compared against in the home page highlights.
export const COMPARE_RANGE = {
  short_term: 'medium_term',
  medium_term: 'long_term',
  long_term: 'short_term',
} as const;

// Top Charts movement baseline: the next-longer range, so arrows read as
// "rising/falling lately". 12 months has no longer range; it instead flags
// tracks missing from the last 4 weeks as fading (FADING_SOURCE).
export const MOVEMENT_BASE = {
  short_term: 'medium_term',
  medium_term: 'long_term',
  long_term: null,
} as const;
export const FADING_SOURCE = 'short_term';

// Each range is fetched at Spotify's max page size (Top Charts shows all of
// it); Home features only the top slice.
export const TRACK_FETCH_LIMIT = 50;
export const HOME_TRACK_COUNT = 10;

// Spotify OAuth scopes
export const SPOTIFY_SCOPES = 'user-top-read user-read-private';

// Primary navigation (desktop sidebar + mobile tab bar). `match` is the route
// prefix that marks the item active; track detail pages belong to Top Charts.
export const NAV_ITEMS = [
  { label: 'Home', icon: 'home', to: '/', match: null },
  { label: 'Top Charts', icon: 'leaderboard', to: '/tracks', match: '/track' },
] as const;
