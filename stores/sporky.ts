import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { UserDTO, Track, Movement } from '~/types';

type MoverKind = 'climber' | 'new' | 'drop' | 'fading';
import { mapTrackToSong } from '~/utils/mapper';
import { generateRandomString } from '~/utils/common';
import { useSpotifyApi } from '~/composables/useSpotifyApi';
import {
  COOKIE_NAME,
  OAUTH_STATE_COOKIE,
  SPOTIFY_AUTH_BASE,
  TIME_RANGES,
  TRACK_FETCH_LIMIT,
  HOME_TRACK_COUNT,
  SPOTIFY_SCOPES,
  COMPARE_RANGE,
  MOVEMENT_BASE,
  FADING_SOURCE,
} from '~/utils/const';

// Types for better type safety
type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type ApiState = 'idle' | 'loading' | 'success' | 'error';

export const useSporky = defineStore('sporky-store', () => {
  // Composables
  const {
    getCurrentUser,
    getTopTracks: fetchTopTracks,
    getTracksByIds,
  } = useSpotifyApi();

  // Cookie reference (create once, reuse everywhere)
  const accessToken = useCookie(COOKIE_NAME);

  // State
  const errorMessage = ref<string | null>(null);
  const tracks = ref<Record<TimeRange, Track[]>>({
    short_term: [],
    medium_term: [],
    long_term: [],
  });
  const timeRange = ref<TimeRange>(TIME_RANGES.SHORT_TERM);
  const apiState = ref<ApiState>('idle');
  const userProfile = ref<UserDTO | null>(null);

  // Computed
  const isLoading = computed(() => apiState.value === 'loading');
  const hasError = computed(() => apiState.value === 'error');
  // Nothing requested yet (e.g. the server render before onMounted fetches).
  const isIdle = computed(() => apiState.value === 'idle');
  const currentTracks = computed(() => tracks.value[timeRange.value]);
  const isAuthenticated = computed(() => {
    return !!accessToken.value;
  });

  // Business logic: Computed properties for music analytics

  // Home features only the top slice of the fetched chart.
  const topTenTracks = computed(() =>
    currentTracks.value.slice(0, HOME_TRACK_COUNT),
  );

  // How the current range's top 10 compares with a neighbouring range.
  // Null until that range is loaded (see prefetchOtherRanges).
  const comparison = computed(() => {
    const otherRange = COMPARE_RANGE[timeRange.value];
    const other = tracks.value[otherRange];
    const current = topTenTracks.value;
    if (!current.length || !other.length) return null;

    const otherIds = other.map((t) => t.id);
    const otherTopTen = otherIds.slice(0, HOME_TRACK_COUNT);
    const topRankInOther = otherIds.indexOf(current[0].id) + 1; // 0 = absent
    const newEntries = current.filter(
      (t) => !otherTopTen.includes(t.id),
    ).length;
    return {
      otherRange,
      otherSize: other.length,
      topRankInOther,
      newEntries,
    };
  });

  // Range that Top Charts movement is measured against (see MOVEMENT_BASE).
  const movementSource = computed(
    () => MOVEMENT_BASE[timeRange.value] ?? FADING_SOURCE,
  );
  const isMovementReady = computed(
    () => tracks.value[movementSource.value].length > 0,
  );

  // Movement per track id; tracks without a marker are simply absent.
  const movement = computed(() => {
    const result = new Map<string, Movement>();
    if (!isMovementReady.value) return result;
    const source = tracks.value[movementSource.value];

    if (!MOVEMENT_BASE[timeRange.value]) {
      const recent = new Set(source.map((t) => t.id));
      currentTracks.value.forEach((t) => {
        if (!recent.has(t.id)) result.set(t.id, 'fading');
      });
      return result;
    }

    const baseRank = new Map(source.map((t, i) => [t.id, i + 1]));
    currentTracks.value.forEach((t, i) => {
      const was = baseRank.get(t.id);
      result.set(t.id, was ? was - (i + 1) : 'new');
    });
    return result;
  });

  // Headline movers for the Top Charts strip: biggest climb, best-ranked new
  // entry and biggest drop; on 12 months, the three best-ranked fading tracks.
  const biggestMovers = computed(() => {
    const ranked = currentTracks.value.map((track, i) => ({
      track,
      rank: i + 1,
      move: movement.value.get(track.id),
    }));
    const pick = (kind: MoverKind, items: typeof ranked) =>
      items.map(({ track, rank, move }) => ({
        kind,
        track,
        rank,
        delta: typeof move === 'number' ? move : 0,
      }));

    if (!MOVEMENT_BASE[timeRange.value]) {
      return pick(
        'fading',
        ranked.filter((r) => r.move === 'fading').slice(0, 3),
      );
    }
    const numeric = ranked.filter(
      (r): r is typeof r & { move: number } => typeof r.move === 'number',
    );
    const climber = numeric.reduce<(typeof numeric)[number] | undefined>(
      (best, r) => (r.move > (best?.move ?? 0) ? r : best),
      undefined,
    );
    const drop = numeric.reduce<(typeof numeric)[number] | undefined>(
      (worst, r) => (r.move < (worst?.move ?? 0) ? r : worst),
      undefined,
    );
    const fresh = ranked.find((r) => r.move === 'new');
    return [
      ...pick('climber', climber ? [climber] : []),
      ...pick('new', fresh ? [fresh] : []),
      ...pick('drop', drop ? [drop] : []),
    ];
  });

  const topArtistData = computed(() => {
    const artistCounts = new Map<string, number>();

    topTenTracks.value.forEach((track) => {
      track.artists.forEach((artist) => {
        const count = artistCounts.get(artist.name) || 0;
        artistCounts.set(artist.name, count + 1);
      });
    });

    let topArtist = '';
    let maxCount = 0;

    artistCounts.forEach((count, artist) => {
      if (count > maxCount) {
        maxCount = count;
        topArtist = artist;
      }
    });

    return { name: topArtist || 'Unknown', count: maxCount };
  });

  const topArtistName = computed(() => topArtistData.value.name);
  const topArtistCount = computed(() => topArtistData.value.count);

  // Helper functions
  const clearError = () => {
    errorMessage.value = null;
    apiState.value = 'idle';
  };

  const setError = (message: string) => {
    errorMessage.value = message;
    apiState.value = 'error';
  };

  const setLoading = () => {
    clearError();
    apiState.value = 'loading';
  };

  const getAccessToken = () => {
    if (!accessToken.value) {
      throw new Error('No access token found');
    }
    return accessToken.value;
  };

  // Get runtime config
  const {
    public: { clientId, redirectUri },
  } = useRuntimeConfig();

  // Actions
  const login = async () => {
    try {
      clearError();
      const state = generateRandomString(32);

      const authorizeUrl = `${SPOTIFY_AUTH_BASE}/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&scope=${encodeURIComponent(SPOTIFY_SCOPES)}&state=${state}`;

      // Store state; server/api/callback.ts rejects the callback if it doesn't match
      const stateCookie = useCookie(OAUTH_STATE_COOKIE);
      stateCookie.value = state;

      // Use window.open for better debugging, fallback to location.href
      if (process.client) {
        const popup = window.open(authorizeUrl, '_self');
        if (!popup) {
          // Fallback if popup blocked
          window.location.href = authorizeUrl;
        }
      }
    } catch (error) {
      setError('Failed to initiate login');
    }
  };

  const logout = () => {
    try {
      // Clear access token using the shared reference
      accessToken.value = null;

      // Clear oauth state
      const stateCookie = useCookie(OAUTH_STATE_COOKIE);
      stateCookie.value = null;

      // Reset store state
      tracks.value = {
        short_term: [],
        medium_term: [],
        long_term: [],
      };
      userProfile.value = null;
      clearError();

      navigateTo('/login');
    } catch (error) {
      // Force navigation even if there's an error
      navigateTo('/login');
    }
  };

  const getUserProfile = async (): Promise<UserDTO | null> => {
    if (userProfile.value) {
      return userProfile.value; // Return cached profile
    }

    // The profile only feeds the greeting and avatar, so it stays out of
    // apiState: its timing and failures must not affect the tracks UI.
    try {
      const response = await getCurrentUser();
      userProfile.value = response;
      return response;
    } catch (error: any) {
      if (error.isUnauthorized) {
        logout();
      }
      return null;
    }
  };

  // Best-effort fill of missing preview URLs via the /tracks endpoint.
  const enrichPreviews = async (songs: Track[]): Promise<void> => {
    const missing = songs.filter((s) => !s.preview && s.id);
    if (missing.length === 0) return;

    try {
      const { tracks: full } = await getTracksByIds(missing.map((s) => s.id));
      const previewById = new Map(
        full.map((t) => [t.id, t.preview_url] as const),
      );
      missing.forEach((s) => {
        s.preview = previewById.get(s.id) ?? s.preview;
      });
    } catch {
      // Non-fatal: previews stay null, playback controls just hide.
    }
  };

  const fetchRange = async (
    range: TimeRange,
    offset = 0,
    limit = TRACK_FETCH_LIMIT,
  ): Promise<Track[]> => {
    const response = await fetchTopTracks(range, offset, limit);
    const songs = response.items.map((item) => mapTrackToSong(item));
    // Enrich missing preview URLs (top-tracks endpoint often returns null).
    await enrichPreviews(songs);
    return songs;
  };

  // Background-load the ranges the user isn't viewing, for comparisons.
  // Never touches apiState; failures just leave `comparison` null.
  const prefetchOtherRanges = async (): Promise<void> => {
    const missing = (Object.keys(tracks.value) as TimeRange[]).filter(
      (range) => range !== timeRange.value && !tracks.value[range].length,
    );
    await Promise.all(
      missing.map(async (range) => {
        try {
          tracks.value[range] = await fetchRange(range);
        } catch {
          // Non-fatal: the comparison sentence is simply not shown.
        }
      }),
    );
  };

  const getTopTracks = async (
    type: string = 'tracks',
    offset: number = 0,
    limit: number = TRACK_FETCH_LIMIT,
  ): Promise<void> => {
    // Return early if already have data for this time range
    if (tracks.value[timeRange.value].length > 0 && offset === 0) {
      return;
    }

    try {
      setLoading();
      const range = timeRange.value;
      const songs = await fetchRange(range, offset, limit);

      tracks.value[range] =
        offset === 0 ? songs : [...tracks.value[range], ...songs];

      apiState.value = 'success';
    } catch (error: any) {
      setError(error.message || 'Failed to fetch top tracks');

      // If unauthorized, redirect to login
      if (error.isUnauthorized) {
        logout();
      }
    }
  };

  // Helper to change time range and fetch tracks
  const setTimeRange = async (newTimeRange: TimeRange) => {
    timeRange.value = newTimeRange;
    await getTopTracks();
  };

  // Find a track by id across all loaded time ranges (used by detail page)
  const getTrackById = (id: string): Track | undefined => {
    for (const range of Object.values(tracks.value)) {
      const found = range.find((t) => t.id === id);
      if (found) return found;
    }
    return undefined;
  };

  return {
    // State
    errorMessage: readonly(errorMessage),
    tracks: readonly(tracks),
    timeRange,
    userProfile: readonly(userProfile),

    // Computed
    isLoading,
    hasError,
    isIdle,
    currentTracks,
    topTenTracks,
    movement,
    movementSource,
    isMovementReady,
    biggestMovers,
    isAuthenticated,
    comparison,
    topArtistData,
    topArtistName,
    topArtistCount,

    // Actions
    login,
    logout,
    getUserProfile,
    getTopTracks,
    prefetchOtherRanges,
    setTimeRange,
    getTrackById,
    clearError,
  };
});
