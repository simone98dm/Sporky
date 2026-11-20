<template>
  <div class="home">
    <!-- Header: the greeting is context; the #1 card below is the page title -->
    <header class="home__header">
      <p class="home__greeting">
        <span class="home__greeting-name">{{ greeting }}.</span>
        {{ subtitle }}
      </p>
      <TimePeriodSelector
        :model-value="timeRange"
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
    <div v-else-if="isPending" class="home__loading" aria-busy="true">
      <span class="sr-only" role="status">Loading your top tracks…</span>
      <div class="skeleton home__loading-hero"></div>
      <div class="home__loading-rows">
        <div v-for="n in 5" :key="n" class="skeleton home__loading-row"></div>
      </div>
    </div>

    <template v-else-if="featuredTrack">
      <!-- #1: the Wrapped-style reveal. Keyed so it replays per range. -->
      <section
        :key="`${timeRange}-${featuredTrack.id}`"
        aria-labelledby="top-track-title"
        class="hero"
      >
        <ArtworkBackdrop
          :src="featuredTrack.cover"
          intensity="strong"
          eager
          fetchpriority="high"
        />

        <!-- Mobile: art + numeral side by side, text below.
             Desktop: art on the left spanning both rows. -->
        <div class="hero__grid">
          <NuxtLink
            :to="`/track/${featuredTrack.id}`"
            class="reveal-art hero__art"
            tabindex="-1"
            aria-hidden="true"
          >
            <TrackArtwork
              :src="featuredTrack.cover"
              loading="eager"
              class="hero__cover"
            />
          </NuxtLink>

          <p class="reveal-numeral hero__numeral" aria-hidden="true">#1</p>

          <div class="reveal-text hero__text">
            <h1 id="top-track-title" class="hero__title">
              <span class="sr-only">Your number 1: </span
              >{{ featuredTrack.name }}
            </h1>
            <p class="hero__artist">
              {{ artistNames(featuredTrack) }}
            </p>

            <div class="hero__actions">
              <NuxtLink :to="`/track/${featuredTrack.id}`" class="details-link">
                Track details
                <span
                  aria-hidden="true"
                  class="material-symbols-outlined details-link__icon"
                >
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
        class="highlights"
      >
        <ul class="highlights__list">
          <li v-for="h in highlights" :key="h.key" class="highlights__item">
            <strong class="highlights__lead">{{ h.lead }}</strong>
            {{ h.rest }}
          </li>
        </ul>
      </section>

      <!-- #2…#N -->
      <section v-if="restTracks.length" aria-labelledby="rest-title">
        <h2 id="rest-title" class="home__section-title">
          The rest of your top {{ trackCount }}
        </h2>
        <ol start="2" class="home__chart">
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
    <EmptyState
      v-else
      icon="music_off"
      :title="`No top tracks for ${rangeLabel}`"
    >
      Spotify needs a bit more listening history for this period. Try a longer
      time range.
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { Track } from '~/types';
import { useSporky } from '~/stores/sporky';
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

<style scoped lang="scss">
.home {
  margin: space(6) auto 0;
  display: flex;
  max-width: 72rem;
  flex-direction: column;
  gap: space(12);

  @include from(md) {
    margin-top: space(10);
  }
}

.home__header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: space(4);

  @include from(md) {
    flex-direction: row;
    align-items: center;
  }
}

.home__greeting {
  @include type(body-lg);
  color: token(on-surface-variant);
}

.home__greeting-name {
  font-weight: 600;
  color: token(on-surface);
}

.home__loading {
  display: flex;
  flex-direction: column;
  gap: space(12);
}

.home__loading-hero {
  height: 22rem;
  border-radius: var(--radius-lg);

  @include from(md) {
    height: space(80);
  }
}

.home__loading-rows {
  display: flex;
  flex-direction: column;
  gap: space(3);
}

.home__loading-row {
  height: space(16);
  border-radius: var(--radius-lg);
}

// ── #1 hero ───────────────────────────────────────────────────────────
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background-color: token(surface-container-low);
}

// Mobile: art + numeral side by side, text below.
// Desktop: art on the left spanning both rows.
.hero__grid {
  display: grid;
  grid-template-columns: 7rem 1fr;
  align-items: flex-end;
  gap: space(5);
  padding: space(6);

  @include from(md) {
    grid-template-columns: 14rem 1fr;
    column-gap: space(10);
    row-gap: space(2);
    padding: space(10);
  }
}

.hero__art {
  display: block;

  @include from(md) {
    grid-row: span 2 / span 2;
    align-self: flex-end;
  }
}

.hero__cover {
  aspect-ratio: 1 / 1;
  width: 100%;
  border-radius: var(--radius-xl);
  box-shadow: $shadow-art;
}

.hero__numeral {
  font-size: 5.5rem;
  font-weight: 800;
  line-height: 0.8;
  letter-spacing: -0.04em;
  color: token(on-surface);

  @include from(md) {
    font-size: 7rem;
  }
}

.hero__text {
  grid-column: span 2 / span 2;
  min-width: 0;

  @include from(md) {
    grid-column: span 1 / span 1;
  }
}

.hero__title {
  @include line-clamp(2);
  text-wrap: balance;
  @include type(display-lg-mobile);
  color: token(on-surface);

  @include from(md) {
    @include type(display-lg);
  }
}

.hero__artist {
  margin-top: space(1);
  @include truncate;
  @include type(body-lg);
  color: token(on-surface-variant);
}

.hero__actions {
  margin-top: space(6);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: space(3) space(6);
}

.details-link {
  display: inline-flex;
  min-height: space(11);
  align-items: center;
  gap: space(1);
  font-weight: 600;
  color: token(on-surface);
  text-underline-offset: 4px;

  &:hover {
    text-decoration-line: underline;
  }
}

.details-link__icon {
  @include icon-size(xl);
}

// ── Highlights and the rest of the chart ──────────────────────────────
.highlights {
  border-block-width: 1px;
  border-color: alpha(outline-variant, 40%);
  padding-block: space(8);
}

.highlights__list {
  display: grid;
  gap: space(6);

  @include from(md) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: space(10);
  }
}

.highlights__item {
  @include size(lg);
  line-height: 1.375;
  color: token(on-surface-variant);
}

.highlights__lead {
  font-weight: 700;
  color: token(on-surface);
}

.home__section-title {
  margin-bottom: space(4);
  @include type(headline-md);
  color: token(on-surface);
}

.home__chart {
  display: flex;
  flex-direction: column;
}

// One authored moment: the #1 reveal. Elements are visible by default;
// the global reduced-motion rule collapses these to an instant render.
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
