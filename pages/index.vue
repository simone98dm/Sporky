<template>
  <div class="mx-auto mt-6 flex max-w-6xl flex-col gap-12 md:mt-10">
    <!-- Header: the greeting is context; the #1 card below is the page title -->
    <header
      class="flex flex-col justify-between gap-4 md:flex-row md:items-center"
    >
      <p class="text-body-lg text-on-surface-variant">
        <span class="font-semibold text-on-surface">{{ greeting }}.</span>
        {{ subtitle }}
      </p>
      <TimePeriodSelector
        :model-value="timeRange"
        variant="short"
        :disabled="isPending"
        @update:model-value="handleTimeRangeChange"
      />
    </header>

    <!-- Error -->
    <ErrorMessage
      v-if="hasError"
      title="Couldn't load your top tracks"
      :message="errorMessage || 'Something went wrong. Please try again.'"
      :show-retry="true"
      @retry="handleRetry"
    />

    <!-- Loading -->
    <div v-else-if="isPending" class="flex flex-col gap-12" aria-busy="true">
      <span class="sr-only" role="status">Loading your top tracks…</span>
      <div class="skeleton h-[22rem] rounded-2xl md:h-80"></div>
      <div class="flex flex-col gap-3">
        <div v-for="n in 5" :key="n" class="skeleton h-16 rounded-lg"></div>
      </div>
    </div>

    <template v-else-if="featuredTrack">
      <!-- #1: the Wrapped-style reveal. Keyed so it replays per range. -->
      <section
        :key="`${timeRange}-${featuredTrack.id}`"
        aria-labelledby="top-track-title"
        class="relative isolate overflow-hidden rounded-2xl bg-surface-container-low"
      >
        <TrackArtwork
          :src="featuredTrack.cover"
          aria-hidden="true"
          loading="eager"
          fetchpriority="high"
          class="absolute inset-0 -z-10 h-full w-full scale-125 opacity-60 blur-3xl saturate-150"
        />
        <div
          class="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/20"
        ></div>

        <!-- Mobile: art + numeral side by side, text below.
             Desktop: art on the left spanning both rows. -->
        <div
          class="grid grid-cols-[7rem_1fr] items-end gap-x-5 gap-y-5 p-6 md:grid-cols-[14rem_1fr] md:gap-x-10 md:gap-y-2 md:p-10"
        >
          <NuxtLink
            :to="`/track/${featuredTrack.id}`"
            class="reveal-art block md:row-span-2 md:self-end"
            tabindex="-1"
            aria-hidden="true"
          >
            <TrackArtwork
              :src="featuredTrack.cover"
              loading="eager"
              class="aspect-square w-full rounded-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]"
            />
          </NuxtLink>

          <p
            class="reveal-numeral text-[5.5rem] font-extrabold leading-[0.8] tracking-[-0.04em] text-on-surface md:text-[7rem]"
            aria-hidden="true"
          >
            #1
          </p>

          <div class="reveal-text col-span-2 min-w-0 md:col-span-1">
            <h1
              id="top-track-title"
              class="line-clamp-2 text-balance text-display-lg-mobile text-on-surface md:text-display-lg"
            >
              <span class="sr-only">Your number 1: </span
              >{{ featuredTrack.name }}
            </h1>
            <p class="mt-1 truncate text-body-lg text-on-surface-variant">
              {{ artistNames(featuredTrack) }}
            </p>

            <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                v-if="featuredTrack.preview"
                type="button"
                class="inline-flex h-12 items-center gap-2 rounded-full bg-primary-container pl-4 pr-6 font-bold text-on-primary-container transition-colors hover:bg-primary-fixed-dim hover:text-on-primary active:scale-[0.98]"
                @click="player.toggle(featuredTrack)"
              >
                <span aria-hidden="true" class="material-symbols-outlined fill">
                  {{ isPlaying(featuredTrack) ? 'pause' : 'play_arrow' }}
                </span>
                {{
                  isPlaying(featuredTrack) ? 'Pause preview' : 'Play preview'
                }}
              </button>
              <p v-else class="text-body-sm text-on-surface-variant">
                No preview available for this track.
              </p>
              <NuxtLink
                :to="`/track/${featuredTrack.id}`"
                class="inline-flex min-h-11 items-center gap-1 font-semibold text-on-surface underline-offset-4 hover:underline"
              >
                Track details
                <span aria-hidden="true" class="material-symbols-outlined">
                  arrow_forward
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- What changed vs another range, said as sentences -->
      <section
        v-if="highlights.length"
        aria-label="Highlights"
        class="border-y border-outline-variant/40 py-8"
      >
        <ul class="grid gap-6 md:grid-cols-3 md:gap-10">
          <li
            v-for="h in highlights"
            :key="h.key"
            class="text-lg leading-snug text-on-surface-variant"
          >
            <strong class="font-bold text-on-surface">{{ h.lead }}</strong>
            {{ h.rest }}
          </li>
        </ul>
      </section>

      <!-- #2…#N -->
      <section v-if="restTracks.length" aria-labelledby="rest-title">
        <h2 id="rest-title" class="mb-4 text-headline-md text-on-surface">
          The rest of your top {{ trackCount }}
        </h2>
        <ol start="2" class="flex flex-col">
          <ChartRow
            v-for="(track, i) in restTracks"
            :key="track.id"
            :track="track"
            :rank="i + 2"
          />
        </ol>
      </section>
    </template>

    <!-- Empty -->
    <section
      v-else
      class="flex flex-col items-center justify-center rounded-xl py-16 text-center layer-1"
    >
      <span
        aria-hidden="true"
        class="material-symbols-outlined mb-4 text-5xl text-on-surface-variant"
        >music_off</span
      >
      <h2 class="mb-2 text-headline-md text-on-surface">
        No top tracks for {{ rangeLabel }}
      </h2>
      <p class="max-w-md text-body-sm text-on-surface-variant">
        Spotify needs a bit more listening history for this period. Try a longer
        time range.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { Track } from '~/types';
import { useSporky } from '~/stores/sporky';
import { useAudioPlayer } from '~/composables/useAudioPlayer';
import { TIME_RANGE_OPTIONS } from '~/utils/const';

type Range = (typeof TIME_RANGE_OPTIONS)[number]['value'];

const store = useSporky();
const {
  errorMessage,
  timeRange,
  isLoading,
  isIdle,
  hasError,
  topTenTracks,
  comparison,
  topArtistName,
  topArtistCount,
  userProfile,
} = storeToRefs(store);

const player = useAudioPlayer();

// Idle covers the server render, before onMounted starts the fetch, so the
// empty state never flashes.
const isPending = computed(() => isLoading.value || isIdle.value);
const featuredTrack = computed(() => topTenTracks.value[0]);
const restTracks = computed(() => topTenTracks.value.slice(1));
const trackCount = computed(() => topTenTracks.value.length);

const labelOf = (range: Range) =>
  TIME_RANGE_OPTIONS.find((o) => o.value === range)?.label.toLowerCase() ?? '';
const rangeLabel = computed(() => labelOf(timeRange.value));

interface Highlight {
  key: string;
  lead: string;
  rest: string;
}

const topRankSentence = (rank: number, other: string, size: number) => {
  if (rank === 1) return `is your #1 ${other} too.`;
  if (rank > 1) return `ranks #${rank} ${other}.`;
  return `isn't in your top ${size} ${other}.`;
};

// Up to three facts: how #1 ranks elsewhere, how much the list turned over,
// and an artist that recurs. Each is skipped when it would say nothing.
const highlights = computed<Highlight[]>(() => {
  const top = featuredTrack.value;
  if (!top) return [];
  const list: Highlight[] = [];
  const c = comparison.value;

  if (c) {
    const other = `over the ${labelOf(c.otherRange)}`;
    list.push({
      key: 'top',
      lead: top.name,
      rest: topRankSentence(c.topRankInOther, other, c.otherSize),
    });
    list.push(
      c.newEntries
        ? {
            key: 'new',
            lead: `${c.newEntries} of these ${trackCount.value}`,
            rest: `aren't in your top 10 ${other}.`,
          }
        : {
            key: 'new',
            lead: 'Every track here',
            rest: `is also in your top 10 ${other}.`,
          },
    );
  }

  if (topArtistCount.value >= 2) {
    list.push({
      key: 'artist',
      lead: topArtistName.value,
      rest: `is on ${topArtistCount.value} of your top ${trackCount.value}.`,
    });
  }
  return list;
});

const subtitle = computed(() =>
  trackCount.value && !isPending.value
    ? `Your top ${trackCount.value} from the ${rangeLabel.value}.`
    : 'Your most-played tracks on Spotify, ranked.',
);

const artistNames = (track: Track) =>
  track.artists.map((a) => a.name).join(', ');
const isPlaying = (track: Track) =>
  player.isCurrent(track.id) && player.isPlaying.value;

// Hour is read on the client only, so server and client render the same text.
const hour = ref<number | null>(null);
const salute = (h: number | null) => {
  if (h === null) return 'Hello';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};
const greeting = computed(() => {
  const name = userProfile.value?.display_name?.split(' ')[0];
  return name ? `${salute(hour.value)}, ${name}` : salute(hour.value);
});

const handleRetry = () => store.getTopTracks();
const handleTimeRangeChange = (value: typeof timeRange.value) =>
  store.setTimeRange(value);

onMounted(async () => {
  hour.value = new Date().getHours();
  store.getUserProfile();
  await store.getTopTracks();
  store.prefetchOtherRanges();
});
</script>

<style scoped>
/* One authored moment: the #1 reveal. Elements are visible by default;
   the global reduced-motion rule collapses these to an instant render. */
.reveal-numeral,
.reveal-art,
.reveal-text {
  animation: 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.reveal-numeral {
  animation-name: wipe-up;
}
.reveal-art {
  animation-name: settle;
  animation-delay: 120ms;
}
.reveal-text {
  animation-name: rise;
  animation-delay: 240ms;
}
@keyframes wipe-up {
  from {
    clip-path: inset(100% 0 0 0);
    transform: translateY(24px);
  }
  to {
    clip-path: inset(0);
    transform: none;
  }
}
@keyframes settle {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
