<template>
  <div
    class="ambient-glow relative flex min-h-screen flex-col overflow-x-hidden bg-background"
  >
    <main
      class="relative z-10 flex w-full flex-1 flex-col p-container-padding pb-32 lg:p-section-margin lg:pb-32"
    >
      <!-- Top bar -->
      <header
        class="mb-section-margin flex w-full items-center justify-between"
      >
        <NuxtLink
          to="/tracks"
          class="group flex items-center gap-unit text-on-surface-variant transition-colors hover:text-primary"
        >
          <span
            aria-hidden="true"
            class="material-symbols-outlined text-2xl transition-transform group-hover:-translate-x-1"
            >arrow_back</span
          >
          <span class="text-body-lg">Back to Library</span>
        </NuxtLink>
        <span
          class="rounded-full border border-outline px-3 py-1 text-label-caps text-on-surface-variant"
          >HQ AUDIO</span
        >
      </header>

      <div
        v-if="track"
        class="grid flex-1 grid-cols-1 gap-card-gap lg:grid-cols-12"
      >
        <!-- Left: artwork + meta -->
        <div class="flex flex-col gap-card-gap lg:col-span-5">
          <div
            class="group relative aspect-square w-full overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <img
              :src="track.cover"
              :alt="`${track.name} artwork`"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              v-if="track.preview"
              class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              <button
                type="button"
                class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container transition-transform hover:scale-105"
                :aria-label="isPlaying ? 'Pause preview' : 'Play preview'"
                @click="player.toggle(track)"
              >
                <span
                  aria-hidden="true"
                  class="material-symbols-outlined fill text-3xl text-on-primary-container"
                  >{{ isPlaying ? 'pause' : 'play_arrow' }}</span
                >
              </button>
            </div>
          </div>

          <div
            class="glass-panel flex flex-col gap-unit rounded-xl p-container-padding"
          >
            <h1
              class="truncate text-display-lg-mobile text-on-surface lg:text-display-lg"
            >
              {{ track.name }}
            </h1>
            <p class="text-headline-md text-on-surface-variant">
              {{ artistNames }}
            </p>
            <div class="mt-2 flex flex-wrap gap-3">
              <span
                class="rounded-full bg-surface-variant px-3 py-1 text-label-caps text-on-surface-variant"
                >{{ track.album }}</span
              >
              <span
                class="rounded-full bg-surface-variant px-3 py-1 text-label-caps text-on-surface-variant"
                >{{ formatTime(track.duration / 1000) }}</span
              >
            </div>
          </div>
        </div>

        <!-- Right: waveform + analytics -->
        <div class="flex flex-col gap-card-gap lg:col-span-7">
          <!-- Listen panel (real Spotify deep link) -->
          <div
            class="glass-panel flex min-h-[300px] flex-1 flex-col items-center justify-center gap-4 rounded-xl p-container-padding text-center"
          >
            <span
              aria-hidden="true"
              class="material-symbols-outlined text-5xl text-primary"
              >headphones</span
            >
            <p class="max-w-sm text-body-lg text-on-surface-variant">
              {{
                track.preview
                  ? 'A 30-second preview is available — use the player below.'
                  : 'No preview is available for this track.'
              }}
            </p>
            <a
              :href="spotifyUrl"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-3 rounded-full bg-primary-container px-6 py-3 font-bold text-on-primary-container transition-colors hover:bg-primary-fixed-dim hover:text-on-primary"
            >
              <svg
                class="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"
                />
              </svg>
              Open in Spotify
            </a>
          </div>

          <!-- Analytics (real Spotify data) -->
          <div class="grid grid-cols-1 gap-gutter md:grid-cols-3">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="glass-panel flex flex-col gap-2 rounded-lg p-gutter"
            >
              <div
                class="flex items-center justify-between text-on-surface-variant"
              >
                <span class="text-body-sm">{{ stat.label }}</span>
                <span
                  aria-hidden="true"
                  class="material-symbols-outlined text-sm"
                  >{{ stat.icon }}</span
                >
              </div>
              <div class="text-headline-md text-on-surface">
                {{ stat.value }}
              </div>
              <div
                class="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-container-high"
              >
                <div
                  class="h-full rounded-full bg-primary"
                  :style="{ width: `${stat.pct}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not found -->
      <div
        v-else-if="!isLoading"
        class="flex flex-1 flex-col items-center justify-center text-center"
      >
        <span
          aria-hidden="true"
          class="material-symbols-outlined mb-4 text-5xl text-on-surface-variant"
          >music_off</span
        >
        <h2 class="mb-2 text-headline-md text-on-surface">Track not found</h2>
        <NuxtLink to="/tracks" class="text-primary hover:underline"
          >Back to your tracks</NuxtLink
        >
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSporky } from '~/stores/sporky';
import { useAudioPlayer } from '~/composables/useAudioPlayer';
import { formatTime } from '~/utils/common';

definePageMeta({ layout: false });

const route = useRoute();
const store = useSporky();
const { currentTracks, isLoading } = storeToRefs(store);
const player = useAudioPlayer();

const trackId = computed(() => route.params.id as string);
const track = computed(() => store.getTrackById(trackId.value));

const artistNames = computed(() =>
  track.value?.artists.map((a) => a.name).join(', '),
);

const spotifyUrl = computed(() =>
  track.value ? `https://open.spotify.com/track/${track.value.id}` : '#',
);

const isPlaying = computed(
  () =>
    !!track.value && player.isCurrent(track.value.id) && player.isPlaying.value,
);

const currentTime = computed(() => player.currentTime.value);
const duration = computed(() => player.duration.value);
const progressPct = computed(() =>
  duration.value ? (currentTime.value / duration.value) * 100 : 0,
);

// Real Spotify metrics (audio-features endpoint is deprecated, so no
// energy/danceability/BPM — we surface the data the API still provides).
const stats = computed(() => {
  const t = track.value;
  if (!t) return [];
  const index = currentTracks.value.findIndex((x) => x.id === t.id);
  const total = currentTracks.value.length || 1;
  return [
    {
      label: 'Popularity',
      icon: 'local_fire_department',
      value: `${t.popularity}%`,
      pct: t.popularity,
    },
    {
      label: 'Length',
      icon: 'schedule',
      value: formatTime(t.duration / 1000),
      pct: Math.min((t.duration / 300000) * 100, 100),
    },
    {
      label: 'Your Rank',
      icon: 'leaderboard',
      value: index >= 0 ? `#${index + 1}` : '—',
      pct: index >= 0 ? ((total - index) / total) * 100 : 0,
    },
  ];
});

// Prev/next within the current time range.
const neighborIds = computed(() => {
  const i = currentTracks.value.findIndex((x) => x.id === trackId.value);
  return {
    prevId: i > 0 ? (currentTracks.value[i - 1]?.id ?? null) : null,
    nextId:
      i >= 0 && i < currentTracks.value.length - 1
        ? (currentTracks.value[i + 1]?.id ?? null)
        : null,
  };
});
const prevId = computed(() => neighborIds.value.prevId);
const nextId = computed(() => neighborIds.value.nextId);

const goTo = (id: string | null) => {
  if (id) navigateTo(`/track/${id}`);
};

const onSeek = (event: MouseEvent) => {
  if (!duration.value) return;
  const el = event.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  player.seek(ratio * duration.value);
};

onMounted(async () => {
  // Ensure the current range is loaded so the track + neighbors resolve.
  if (currentTracks.value.length === 0) {
    await store.getTopTracks();
  }
});
</script>
