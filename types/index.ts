export interface TrackDTO {
  items: TrackDetails[];
  total: number;
  limit: number;
  offset: number;
  previous: null;
  href: string;
  next: string;
}

// Chart movement vs the baseline range: places climbed (negative = dropped),
// 'new' (absent from the baseline chart) or 'fading' (12-month tracks missing
// from the last 4 weeks).
export type Movement = number | 'new' | 'fading';

export interface Track {
  id: string;
  name: string;
  artists: any[];
  album: string;
  cover: string;
  url: string;
  // Not sent to apps registered after Spotify's Nov 2024 API changes.
  popularity?: number;
  duration: number;
}

export interface TrackDetails {
  album: AlbumDTO;
  artists: ArtistDTO[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIDS;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity?: number;
  track_number: number;
  type: ItemType;
  uri: string;
}

export interface AlbumDTO {
  album_type: AlbumType;
  artists: ArtistDTO[];
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: ReleaseDatePrecision;
  total_tracks: number;
  type: AlbumTypeEnum;
  uri: string;
}

export enum AlbumType {
  Album = 'ALBUM',
  Compilation = 'COMPILATION',
  Single = 'SINGLE',
}

export interface ArtistDTO {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: ArtistType;
  uri: string;
}

export interface ExternalUrls {
  spotify: string;
}

export enum ArtistType {
  Artist = 'artist',
}

export interface Image {
  height: number;
  url: string;
  width: number;
}

export enum ReleaseDatePrecision {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}

export enum AlbumTypeEnum {
  Album = 'album',
}

export interface ExternalIDS {
  isrc: string;
}

export enum ItemType {
  Track = 'track',
}

export interface UserDTO {
  country: string;
  display_name: string;
  email?: string; // only returned with the user-read-email scope, which Sporky doesn't request
  explicit_content: ExplicitContent;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
}

export interface ExplicitContent {
  filter_enabled: boolean;
  filter_locked: boolean;
}

export interface Followers {
  href: string;
  total: number;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// ── Playlists (backup feature) ──────────────────────────────────────
// Spotify's 2026 playlist API renamed `tracks` → `items` (and `track` → `item`
// inside each entry); both spellings are accepted so either response works.
export interface PlaylistSummaryDTO {
  id: string;
  name: string;
  description: string | null;
  images: Image[] | null;
  owner: { id: string; display_name: string | null };
  tracks?: { total: number };
  items?: { total: number };
}

export interface PlaylistEntryDTO {
  track?: PlaylistTrackDTO | null;
  item?: PlaylistTrackDTO | null;
}

// Podcast episodes can live in playlists too; only tracks are exported.
export interface PlaylistTrackDTO {
  type: 'track' | 'episode';
  name: string;
  artists?: { name: string }[];
  album?: { name: string; images?: Image[] };
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  owner: string;
  trackCount: number;
}

// The backup record: exactly what gets exported.
export interface PlaylistSong {
  title: string;
  artist: string;
  album: string;
}

// Shape every failed Spotify call is normalised to by `apiRequest`.
export interface ApiError {
  status?: number;
  message: string;
  isUnauthorized: boolean;
}
