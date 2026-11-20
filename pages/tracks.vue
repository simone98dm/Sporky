<template>
  <div class="charts">
    <header>
      <h1 class="charts__title">Top Charts</h1>
      <p class="charts__subtitle">{{ subtitle }}</p>
    </header>

    <!-- Range + legend, pinned under the top bar while scrolling the chart -->
    <div class="charts__toolbar">
      <TimePeriodSelector
        :model-value="timeRange"
        :disabled="isPending"
        @update:model-value="handleTimeRangeChange"
      />
      <p v-if="legend && !isPending" class="charts__legend">
        <span
          aria-hidden="true"
          class="material-symbols-outlined charts__legend-icon"
          >{{ isFading ? 'trending_down' : 'swap_vert' }}</span
        >
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
    <div v-else-if="isPending" class="charts__loading" aria-busy="true">
      <span class="sr-only" role="status">Loading your chart…</span>
      <div class="movers">
        <div
          v-for="n in 3"
          :key="`m${n}`"
          class="skeleton charts__loading-mover"
        ></div>
      </div>
      <div class="skeleton charts__loading-podium"></div>
      <div v-for="n in 5" :key="n" class="skeleton charts__loading-row"></div>
    </div>

    <template v-else-if="currentTracks.length">
      <!-- What moved: the reason this page exists -->
      <section v-if="biggestMovers.length" aria-labelledby="movers-title">
        <h2 id="movers-title" class="charts__section-title">
          {{ isFading ? 'Fading from your rotation' : 'Biggest movers' }}
        </h2>
        <ul class="movers">
          <li v-for="m in biggestMovers" :key="`${m.kind}-${m.track.id}`">
            <NuxtLink :to="`/track/${m.track.id}`" class="mover">
              <ArtworkBackdrop
                :src="m.track.cover"
                intensity="soft"
                overlay="none"
              />
              <div class="mover__top">
                <span
                  class="mover__headline"
                  :class="{ 'mover__headline--new': m.kind === 'new' }"
                >
                  {{ moverHeadline(m) }}
                </span>
                <TrackArtwork :src="m.track.cover" class="mover__cover" />
              </div>
              <div class="mover__text">
                <p class="mover__name">
                  <span class="sr-only">{{ moverKindLabel[m.kind] }}: </span
                  >{{ m.track.name }}
                </p>
                <p class="mover__detail">
                  {{ moverDetail(m) }}
                </p>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <!-- Podium: #1–#3 over the #1 cover's colour -->
      <section aria-label="Top 3" class="podium">
        <ArtworkBackdrop :src="currentTracks[0]?.cover" overlay="side" eager />
        <ol class="charts__list">
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
        <h2
          id="rest-title"
          class="charts__section-title charts__section-title--tight"
        >
          The rest of your top {{ currentTracks.length }}
        </h2>
        <ol start="4" class="charts__list">
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
          class="show-all"
          @click="showAll = true"
        >
          Show all {{ currentTracks.length }}
          <span
            aria-hidden="true"
            class="material-symbols-outlined show-all__icon"
            >expand_more</span
          >
        </button>
      </section>
    </template>

    <!-- Empty -->
    <EmptyState
      v-else
      icon="music_off"
      :title="`No chart for the ${rangeLabel}`"
    >
      {{
        isFading
          ? "Spotify doesn't have enough listening history for you yet."
          : 'Spotify needs a bit more listening history for this period. Try a longer time range.'
      }}
    </EmptyState>
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

<style scoped lang="scss">
.charts {
  margin: space(6) auto 0;
  display: flex;
  max-width: 64rem;
  flex-direction: column;
  gap: space(8);

  @include from(md) {
    margin-top: space(10);
  }
}

.charts__title {
  margin-bottom: space(2);
  @include type(display-lg-mobile);
  color: token(on-surface);

  @include from(md) {
    @include type(display-lg);
  }
}

.charts__subtitle {
  @include type(body-lg);
  color: token(on-surface-variant);
}

// Range + legend, pinned under the top bar and bleeding to the column edge.
.charts__toolbar {
  position: sticky;
  top: var(--top-bar-height);
  z-index: 20;
  margin-inline: calc(-1 * var(--gutter));
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: space(2) space(6);
  background-color: alpha(surface, 60%);
  padding: space(3) var(--gutter);
  backdrop-filter: blur(64px);

  @include from(md) {
    margin-inline: calc(-1 * var(--container-padding));
    padding-inline: var(--container-padding);
  }
}

.charts__legend {
  display: flex;
  align-items: center;
  gap: space(1.5);
  @include type(body-sm);
  color: token(on-surface-variant);
}

.charts__legend-icon {
  @include icon-size(base);
}

.charts__loading {
  display: flex;
  flex-direction: column;
  gap: space(3);
}

.charts__loading-mover {
  height: space(36);
  border-radius: var(--radius-xl);
}

.charts__loading-podium {
  height: space(72);
  border-radius: var(--radius-lg);
}

.charts__loading-row {
  height: space(16);
  border-radius: var(--radius-lg);
}

.charts__section-title {
  margin-bottom: space(4);
  @include type(headline-md);
  color: token(on-surface);

  &--tight {
    margin-bottom: space(2);
  }
}

.charts__list {
  display: flex;
  flex-direction: column;
}

// ── Biggest movers ────────────────────────────────────────────────────
.movers {
  display: grid;
  // minmax(0, 1fr), not auto: truncated titles must not widen the column.
  grid-template-columns: minmax(0, 1fr);
  gap: space(4);

  @include from(md) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.mover {
  position: relative;
  isolation: isolate;
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: space(3);
  overflow: hidden;
  border-radius: var(--radius-xl);
  background-color: token(surface-container-low);
  padding: space(5);
  @include transition-colors;

  &:hover {
    background-color: token(surface-container);
  }
}

.mover__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: space(4);
}

.mover__headline {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: token(on-surface);

  &--new {
    color: token(primary);
  }
}

.mover__cover {
  width: space(14);
  height: space(14);
  flex-shrink: 0;
  border-radius: var(--radius-md);
  box-shadow: $shadow-lg;
}

.mover__text {
  min-width: 0;
}

.mover__name {
  @include truncate;
  font-weight: 600;
  color: token(on-surface);
}

.mover__detail {
  @include truncate;
  @include type(body-sm);
  color: token(on-surface-variant);
}

// ── Podium (#1–#3) ────────────────────────────────────────────────────
.podium {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background-color: token(surface-container-low);
  padding: space(2) space(3);

  @include from(md) {
    padding: space(4) space(6);
  }
}

.show-all {
  margin-top: space(6);
  display: inline-flex;
  min-height: space(11);
  align-items: center;
  gap: space(2);
  border: 1px solid token(outline-variant);
  border-radius: var(--radius-full);
  padding-inline: space(6);
  font-weight: 600;
  color: token(on-surface);
  @include transition-colors;

  &:hover {
    background-color: token(surface-container);
  }
}

.show-all__icon {
  @include icon-size(xl);
}
</style>
