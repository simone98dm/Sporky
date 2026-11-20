import {
  SPOTIFY_API_BASE,
  COOKIE_NAME,
  PLAYLIST_PAGE_LIMIT,
  SUGGESTION_SEARCH_LIMIT,
} from '~/utils/const';
import { useErrorHandler } from './useErrorHandler';
import type {
  UserDTO,
  TrackDTO,
  TrackDetails,
  PlaylistSummaryDTO,
  PlaylistEntryDTO,
  ApiError,
} from '~/types';

// Pages are fetched with at most this many requests in flight.
const PAGE_CONCURRENCY = 4;
const MAX_RATE_LIMIT_RETRIES = 2;
// Used when Spotify's Retry-After isn't readable (CORS may hide it).
const RATE_LIMIT_FALLBACK_DELAY_MS = 1500;
// A longer wait than this is surfaced to the user instead of silently retried.
const RATE_LIMIT_MAX_DELAY_MS = 10_000;
// Only what the backup needs; the mapper reads `item` (2026 API) or `track`.
const ENTRY_FIELDS =
  'items(item(type,name,artists(name),album(name)),track(type,name,artists(name),album(name))),next,total';

interface ApiRequestOptions {
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
}

interface Page<T> {
  items: T[];
  next: string | null;
  total?: number;
}

export type ProgressCallback = (loaded: number, total: number) => void;

export const isApiError = (e: unknown): e is ApiError =>
  typeof e === 'object' &&
  e !== null &&
  typeof (e as ApiError).message === 'string' &&
  typeof (e as ApiError).isUnauthorized === 'boolean';

// Retry-After is in seconds; the fallback applies when absent or unreadable.
const retryDelayMs = (error: unknown): number => {
  const raw = (
    error as { response?: { headers?: Headers } } | undefined
  )?.response?.headers?.get('retry-after');
  const seconds = Number(raw);
  return raw && Number.isFinite(seconds)
    ? seconds * 1000
    : RATE_LIMIT_FALLBACK_DELAY_MS;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Composable for Spotify API interactions
 */
export const useSpotifyApi = () => {
  const { getErrorMessage, isUnauthorizedError } = useErrorHandler();

  const getHeaders = (): Record<string, string> => {
    const accessToken = useCookie(COOKIE_NAME);

    if (!accessToken.value) {
      throw new Error('No access token available');
    }

    return {
      Authorization: `Bearer ${accessToken.value}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  };

  const apiRequest = async <T>(
    endpoint: string,
    options: ApiRequestOptions = {},
  ): Promise<T> => {
    for (let attempt = 0; ; attempt++) {
      try {
        const headers = getHeaders();

        return await $fetch<T>(`${SPOTIFY_API_BASE}${endpoint}`, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });
      } catch (error: unknown) {
        const status = (error as { status?: number } | null)?.status;
        if (status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
          const delay = retryDelayMs(error);
          if (delay <= RATE_LIMIT_MAX_DELAY_MS) {
            await sleep(delay);
            continue;
          }
        }
        const apiError: ApiError = {
          status,
          message: getErrorMessage(error),
          isUnauthorized: isUnauthorizedError(error),
        };
        throw apiError;
      }
    }
  };

  const getCurrentUser = (): Promise<UserDTO> => {
    return apiRequest<UserDTO>('/me');
  };

  const getTopTracks = (
    timeRange: string,
    offset = 0,
    limit = 10,
  ): Promise<TrackDTO> => {
    return apiRequest<TrackDTO>('/me/top/tracks', {
      params: {
        time_range: timeRange,
        offset,
        limit,
      },
    });
  };

  // First page tells us `total`; the rest are fetched with a small pool and
  // stitched back in offset order.
  const fetchAllPages = async <T>(
    endpoint: string,
    params: Record<string, string> = {},
    onProgress?: ProgressCallback,
  ): Promise<T[]> => {
    const fetchPage = (offset: number) =>
      apiRequest<Page<T>>(endpoint, {
        params: { ...params, limit: PLAYLIST_PAGE_LIMIT, offset },
      });

    const first = await fetchPage(0);
    const total = first.total ?? first.items.length;
    let loaded = first.items.length;
    onProgress?.(loaded, total);
    if (!first.next || first.items.length === 0) return first.items;

    const offsets: number[] = [];
    for (let o = PLAYLIST_PAGE_LIMIT; o < total; o += PLAYLIST_PAGE_LIMIT) {
      offsets.push(o);
    }
    const pages: T[][] = new Array(offsets.length);
    // One iterator shared by all workers: each next() hands out one page.
    const queue = offsets.entries();
    let failed = false;

    const worker = async () => {
      for (const [index, offset] of queue) {
        if (failed) return;
        try {
          const { items } = await fetchPage(offset);
          pages[index] = items;
          loaded += items.length;
          onProgress?.(loaded, total);
        } catch (error) {
          failed = true; // stop the other workers from starting new pages
          throw error;
        }
      }
    };
    await Promise.all(
      Array.from(
        { length: Math.min(PAGE_CONCURRENCY, offsets.length) },
        worker,
      ),
    );

    return [...first.items, ...pages.flat()];
  };

  // Recommendations and related artists are gone for new apps (Nov 2024),
  // so suggestions come from searching the artist's catalogue.
  const searchArtistTracks = async (
    artist: string,
  ): Promise<TrackDetails[]> => {
    const response = await apiRequest<{ tracks: { items: TrackDetails[] } }>(
      '/search',
      {
        params: {
          q: `artist:"${artist.replaceAll('"', '')}"`,
          type: 'track',
          limit: SUGGESTION_SEARCH_LIMIT,
        },
      },
    );
    return response.tracks.items;
  };

  const getAllPlaylists = (): Promise<PlaylistSummaryDTO[]> =>
    fetchAllPages<PlaylistSummaryDTO>('/me/playlists');

  const getPlaylist = (id: string): Promise<PlaylistSummaryDTO> =>
    apiRequest<PlaylistSummaryDTO>(`/playlists/${encodeURIComponent(id)}`);

  // `/items` is the current endpoint; `/tracks` is the pre-2026 one, kept as a
  // fallback for apps still served the old API.
  const getAllPlaylistEntries = async (
    id: string,
    onProgress?: ProgressCallback,
  ): Promise<PlaylistEntryDTO[]> => {
    const base = `/playlists/${encodeURIComponent(id)}`;
    const params = {
      market: 'from_token',
      additional_types: 'track',
      fields: ENTRY_FIELDS,
    };
    try {
      return await fetchAllPages<PlaylistEntryDTO>(
        `${base}/items`,
        params,
        onProgress,
      );
    } catch (error: unknown) {
      if (!isApiError(error) || error.status !== 404) throw error;
      return fetchAllPages<PlaylistEntryDTO>(
        `${base}/tracks`,
        params,
        onProgress,
      );
    }
  };

  return {
    getCurrentUser,
    searchArtistTracks,
    getAllPlaylists,
    getPlaylist,
    getAllPlaylistEntries,
    getTopTracks,
    apiRequest,
  };
};
