import { computed, onMounted, ref } from 'vue';
import type { Playlist, PlaylistSong, ApiError } from '~/types';
import { mapPlaylist, mapPlaylistEntry } from '~/utils/mapper';
import { useSporky } from '~/stores/sporky';
import { isApiError, useSpotifyApi } from '~/composables/useSpotifyApi';

const PLAYLISTS_KEY = 'playlists';

// What the error card offers: retry, re-login (missing scope), or nothing.
export type ErrorAction = 'retry' | 'login' | 'none';

interface LoadProgress {
  loaded: number;
  total: number;
}

const UNEXPECTED: ApiError = {
  message: 'An unexpected error occurred',
  isUnauthorized: false,
};

// Runs `fn`; on failure records the error (logging out on 401) and returns
// `fallback`, so a failed background refresh never wipes data already shown.
const useGuard = () => {
  const store = useSporky();
  const failure = ref<ApiError | null>(null);

  const guard = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    failure.value = null;
    try {
      return await fn();
    } catch (error: unknown) {
      const apiError = isApiError(error) ? error : UNEXPECTED;
      if (apiError.isUnauthorized) store.logout();
      failure.value = apiError;
      return fallback;
    }
  };

  return { failure, guard };
};

export const usePlaylists = () => {
  const { getAllPlaylists } = useSpotifyApi();
  const { failure, guard } = useGuard();
  const cache = useNuxtData<Playlist[]>(PLAYLISTS_KEY);
  const hadCache = !!cache.data.value;

  const { data, status, refresh } = useAsyncData<Playlist[] | null>(
    PLAYLISTS_KEY,
    () =>
      guard(
        async () => (await getAllPlaylists()).map(mapPlaylist),
        cache.data.value ?? null,
      ),
    {
      server: false,
      // Stale-while-revalidate. A non-undefined getCachedData result makes
      // Nuxt skip the fetch entirely, so serve the cache for the initial run
      // only (instant render, no fetch) and revalidate manually on mount.
      // Manual refreshes get `undefined` and always hit the network.
      getCachedData: (key, nuxtApp, ctx) =>
        ctx.cause === 'initial'
          ? (nuxtApp.payload.data[key] ?? undefined)
          : undefined,
    },
  );

  if (hadCache) onMounted(() => refresh());

  const playlists = computed(() => data.value ?? []);
  const isLoading = computed(
    () =>
      !data.value && (status.value === 'pending' || status.value === 'idle'),
  );
  const needsLogin = computed(
    () => !data.value && failure.value?.status === 403,
  );
  // Only surfaced when there is nothing to show.
  const errorMessage = computed(() => {
    if (data.value || !failure.value) return '';
    // Sessions from before this feature lack the playlist scopes.
    return needsLogin.value
      ? 'Sporky needs your permission to read playlists. Log in again to grant it.'
      : failure.value.message;
  });
  const errorAction = computed<ErrorAction>(() =>
    needsLogin.value ? 'login' : 'retry',
  );

  return {
    playlists,
    status,
    isLoading,
    errorMessage,
    errorAction,
    refresh: () => refresh(),
  };
};

export const usePlaylist = (id: string) => {
  const { getPlaylist, getAllPlaylistEntries } = useSpotifyApi();
  const { failure, guard } = useGuard();
  const progress = ref<LoadProgress | null>(null);

  // The list usually has the header already; only deep links need a fetch.
  const { data: list } = useNuxtData<Playlist[]>(PLAYLISTS_KEY);
  const cached = computed(() => list.value?.find((p) => p.id === id) ?? null);

  const meta = useAsyncData<Playlist | null>(
    `playlist-meta:${id}`,
    () => guard(async () => mapPlaylist(await getPlaylist(id)), null),
    { server: false, immediate: !cached.value },
  );

  const entries = useAsyncData<{
    songs: PlaylistSong[];
    skipped: number;
  } | null>(
    `playlist-songs:${id}`,
    () =>
      guard(async () => {
        progress.value = null;
        const raw = await getAllPlaylistEntries(id, (loaded, total) => {
          progress.value = { loaded, total };
        });
        const mapped = raw.map(mapPlaylistEntry);
        const songs = mapped.filter((s): s is PlaylistSong => s !== null);
        return { songs, skipped: mapped.length - songs.length };
      }, null),
    { server: false },
  );

  const playlist = computed(() => cached.value ?? meta.data.value);
  const songs = computed(() => entries.data.value?.songs ?? []);
  const skipped = computed(() => entries.data.value?.skipped ?? 0);
  const isLoadingSongs = computed(
    () =>
      !failure.value &&
      (entries.status.value === 'pending' || entries.status.value === 'idle'),
  );

  const errorAction = computed<ErrorAction>(() => {
    if (failure.value?.status === 403) return 'login';
    if (failure.value?.status === 404) return 'none';
    return 'retry';
  });
  const errorMessage = computed(() => {
    const e = failure.value;
    if (!e) return '';
    if (e.status === 403) {
      return "Spotify didn't share this playlist's songs with Sporky. Logging in again grants playlist access; if it still fails, Spotify only allows backups of playlists you own or collaborate on.";
    }
    if (e.status === 404) return 'This playlist no longer exists on Spotify.';
    return e.message;
  });

  const retry = () => {
    failure.value = null;
    if (!playlist.value) meta.refresh();
    return entries.refresh();
  };

  return {
    playlist,
    songs,
    skipped,
    progress,
    isLoadingSongs,
    errorMessage,
    errorAction,
    retry,
  };
};
