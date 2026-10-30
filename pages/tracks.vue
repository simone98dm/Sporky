<template>
  <div class="mx-auto mt-6 flex max-w-5xl flex-col gap-8 md:mt-10">
    <header>
      <h1
        class="mb-2 text-display-lg-mobile text-on-surface md:text-display-lg"
      >
        Top Charts
      </h1>
      <p class="text-body-lg text-on-surface-variant">{{ subtitle }}</p>
    </header>

    <!-- Range + legend, pinned under the top bar while scrolling the chart -->
    <div
      class="sticky top-16 z-20 -mx-gutter flex flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-surface/60 px-gutter py-3 backdrop-blur-3xl md:-mx-container-padding md:px-container-padding"
    >
      <TimePeriodSelector
        :model-value="timeRange"
        variant="short"
        :disabled="isPending"
        @update:model-value="handleTimeRangeChange"
      />
      <p
        v-if="legend && !isPending"
        class="flex items-center gap-1.5 text-body-sm text-on-surface-variant"
      >
        <span aria-hidden="true" class="material-symbols-outlined text-base">{{
          isFading ? 'trending_down' : 'swap_vert'
        }}</span>
        {{ legend }}
      </p>
    </div>

    <!-- Error -->
    <ErrorMessage
      v-if="hasError"
      title="Couldn't load your top tracks"
      :message="errorMessage || 'Something went wrong. Please try again.'"
      :show-retry="true"
      @retry="handleRetry"
    />

    <!-- Loading -->
    <div v-else-if="isPending" class="flex flex-col gap-3" aria-busy="true">
      <span class="sr-only" role="status">Loading your chart…</span>
      <div class="grid gap-4 md:grid-cols-3">
        <div
          v-for="n in 3"
          :key="`m${n}`"
          class="skeleton h-36 rounded-xl"
        ></div>
      </div>
      <div class="skeleton h-72 rounded-2xl"></div>
      <div v-for="n in 5" :key="n" class="skeleton h-16 rounded-lg"></div>
    </div>

    <template v-else-if="currentTracks.length">
      <!-- What moved: the reason this page exists -->
      <section v-if="biggestMovers.length" aria-labelledby="movers-title">
        <h2 id="movers-title" class="mb-4 text-headline-md text-on-surface">
          {{ isFading ? 'Fading from your rotation' : 'Biggest movers' }}
        </h2>
        <ul class="grid gap-4 md:grid-cols-3">
          <li v-for="m in biggestMovers" :key="`${m.kind}-${m.track.id}`">
            <NuxtLink
              :to="`/track/${m.track.id}`"
              class="relative isolate flex h-full flex-col gap-3 overflow-hidden rounded-xl bg-surface-container-low p-5 transition-colors hover:bg-surface-container"
            >
              <TrackArtwork
                :src="m.track.cover"
                aria-hidden="true"
                class="absolute inset-0 -z-10 h-full w-full scale-150 opacity-35 blur-2xl saturate-150"
              />
              <div class="flex items-center justify-between gap-4">
                <span
                  class="text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] text-on-surface tabular-nums"
                  :class="{ 'text-primary': m.kind === 'new' }"
                >
                  {{ moverHeadline(m) }}
                </span>
                <TrackArtwork
                  :src="m.track.cover"
                  class="h-14 w-14 shrink-0 rounded-md shadow-lg"
                />
              </div>
              <div class="min-w-0">
                <p class="truncate font-semibold text-on-surface">
                  <span class="sr-only">{{ moverKindLabel[m.kind] }}: </span
                  >{{ m.track.name }}
                </p>
                <p class="truncate text-body-sm text-on-surface-variant">
                  {{ moverDetail(m) }}
                </p>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <!-- Podium: #1–#3 over the #1 cover's colour -->
      <section
        aria-label="Top 3"
        class="relative isolate overflow-hidden rounded-2xl bg-surface-container-low px-3 py-2 md:px-6 md:py-4"
      >
        <TrackArtwork
          :src="currentTracks[0].cover"
          aria-hidden="true"
          loading="eager"
          class="absolute inset-0 -z-10 h-full w-full scale-125 opacity-50 blur-3xl saturate-150"
        />
        <div
          class="absolute inset-0 -z-10 bg-gradient-to-r from-background/90 via-background/60 to-background/30"
        ></div>
        <ol class="flex flex-col">
          <ChartRow
            v-for="(track, i) in podium"
            :key="track.id"
            :track="track"
            :rank="i + 1"
            :movement="movementOf(track.id)"
            large
          />
        </ol>
      </section>

      <!-- #4 onwards: 20 at first, the rest on request -->
      <section v-if="rest.length" aria-labelledby="rest-title">
        <h2 id="rest-title" class="mb-2 text-headline-md text-on-surface">
          The rest of your top {{ currentTracks.length }}
        </h2>
        <ol start="4" class="flex flex-col">
          <ChartRow
            v-for="(track, i) in visibleRest"
            :key="track.id"
            :track="track"
            :rank="i + 4"
            :movement="movementOf(track.id)"
          />
        </ol>
        <button
          v-if="hiddenCount > 0"
          type="button"
          class="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-outline-variant px-6 font-semibold text-on-surface transition-colors hover:bg-surface-container"
          @click="showAll = true"
        >
          Show all {{ currentTracks.length }}
          <span aria-hidden="true" class="material-symbols-outlined"
            >expand_more</span
          >
        </button>
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
        No chart for the {{ rangeLabel }}
      </h2>
      <p class="max-w-md text-body-sm text-on-surface-variant">
        {{
          isFading
            ? "Spotify doesn't have enough listening history for you yet."
            : 'Spotify needs a bit more listening history for this period. Try a longer time range.'
        }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSporky } from '~/stores/sporky';
import { MOVEMENT_BASE, TIME_RANGE_OPTIONS } from '~/utils/const';

type Range = (typeof TIME_RANGE_OPTIONS)[number]['value'];

// Rows shown before "Show all".
const INITIAL_ROWS = 20;

const store = useSporky();
const {
  errorMessage,
  timeRange,
  isLoading,
  isIdle,
  hasError,
  currentTracks,
  movement,
  movementSource,
  isMovementReady,
  biggestMovers,
} = storeToRefs(store);

type Mover = (typeof biggestMovers.value)[number];

// Idle covers the server render, before onMounted starts the fetch.
const isPending = computed(() => isLoading.value || isIdle.value);
const podium = computed(() => currentTracks.value.slice(0, 3));
const rest = computed(() => currentTracks.value.slice(3));

const showAll = ref(false);
const visibleRest = computed(() =>
  showAll.value ? rest.value : rest.value.slice(0, INITIAL_ROWS - 3),
);
const hiddenCount = computed(
  () => rest.value.length - visibleRest.value.length,
);

const labelOf = (range: Range) =>
  TIME_RANGE_OPTIONS.find((o) => o.value === range)?.label.toLowerCase() ?? '';
const rangeLabel = computed(() => labelOf(timeRange.value));
const sourceLabel = computed(() => labelOf(movementSource.value));
const isFading = computed(() => !MOVEMENT_BASE[timeRange.value]);

const subtitle = computed(() => {
  const n = currentTracks.value.length;
  return n && !isPending.value
    ? `Your top ${n} from the ${rangeLabel.value}, ranked by Spotify.`
    : 'Your most-listened tracks, ranked by Spotify.';
});

// Only claim a comparison once its data is actually there.
const legend = computed(() => {
  if (!isMovementReady.value) return '';
  return isFading.value
    ? `Fading: not in your top 50 for the ${sourceLabel.value}`
    : `Places moved vs the ${sourceLabel.value} · New: not in that chart`;
});

// null = no marker for this row (or the baseline hasn't loaded yet).
const movementOf = (id: string) => movement.value.get(id) ?? null;

const moverKindLabel: Record<Mover['kind'], string> = {
  climber: 'Biggest climber',
  new: 'Highest new entry',
  drop: 'Biggest drop',
  fading: 'Fading',
};
const moverHeadline = (m: Mover) => {
  if (m.kind === 'new') return 'New';
  if (m.kind === 'fading') return `#${m.rank}`;
  return m.delta > 0 ? `+${m.delta}` : `${m.delta}`.replace('-', '−');
};
const moverDetail = (m: Mover) => {
  const source = sourceLabel.value;
  if (m.kind === 'new') return `Now #${m.rank} · not in your ${source} chart`;
  if (m.kind === 'fading') return `Not in your top 50 for the ${source}`;
  return `Now #${m.rank} · was #${m.rank + m.delta} over the ${source}`;
};

const handleRetry = () => store.getTopTracks();
const handleTimeRangeChange = (value: typeof timeRange.value) => {
  showAll.value = false;
  store.setTimeRange(value);
};

onMounted(async () => {
  await store.getTopTracks();
  store.prefetchOtherRanges();
});
</script>
