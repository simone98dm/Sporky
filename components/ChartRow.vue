<template>
  <li :class="['chart-row', { 'chart-row--large': large }]">
    <!-- Rank (visual only; the <ol> and the link text carry it for AT) -->
    <span aria-hidden="true" class="chart-row__rank">
      {{ rank }}
    </span>

    <!-- Movement vs the baseline range (visual; the link text carries it) -->
    <span
      v-if="movement !== undefined"
      aria-hidden="true"
      class="chart-row__movement"
    >
      <span v-if="movement === 'new'" class="movement-new">New</span>
      <span
        v-else-if="movement === 'fading'"
        class="material-symbols-outlined movement-icon movement--muted"
        title="Fading"
        >trending_down</span
      >
      <template v-else-if="typeof movement === 'number' && movement > 0">
        <span class="material-symbols-outlined movement-icon movement--up"
          >arrow_upward</span
        >
        <span class="movement--up">{{ movement }}</span>
      </template>
      <template v-else-if="typeof movement === 'number' && movement < 0">
        <span class="material-symbols-outlined movement-icon movement--muted"
          >arrow_downward</span
        >
        <span class="movement--muted">{{ -movement }}</span>
      </template>
      <span
        v-else-if="movement === 0"
        class="material-symbols-outlined movement-icon movement--flat"
        >remove</span
      >
    </span>

    <TrackArtwork :src="track.cover" class="chart-row__cover" />

    <!-- Title link; its ::after stretches over the whole row. The sr-only
         prefix stays before the title: after a truncated title it would sit
         off-screen and widen the page. -->
    <div class="chart-row__text">
      <NuxtLink
        :to="`/track/${track.id}`"
        :title="track.name"
        class="chart-row__title"
      >
        <span class="sr-only"
          >Number {{ rank
          }}{{ movementLabel ? `, ${movementLabel}` : '' }}: </span
        >{{ track.name }}
      </NuxtLink>
      <p class="chart-row__artist">
        {{ artistNames }}
      </p>
    </div>

    <span class="chart-row__duration">
      {{ formatTime(track.duration / 1000) }}
    </span>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Movement, Track } from '~/types';
import { formatTime } from '~/utils/common';

interface ChartRowProps {
  track: Track;
  rank: number;
  /**
   * Movement marker; null keeps the column empty (no marker, or the baseline
   * range is still loading); omit it to hide the column entirely.
   */
  movement?: Movement | null;
  large?: boolean;
}

const { track, rank, movement, large = false } = defineProps<ChartRowProps>();

const artistNames = computed(() => track.artists.map((a) => a.name).join(', '));

const movementLabel = computed(() => {
  if (movement === undefined || movement === null) return '';
  if (movement === 'new') return 'new entry';
  if (movement === 'fading') return 'fading from your recent listening';
  if (movement > 0) return `up ${movement}`;
  if (movement < 0) return `down ${-movement}`;
  return 'no change';
});
</script>

<style scoped lang="scss">
// One chart entry. The title link's ::after covers the row, so the whole row
// is clickable.
.chart-row {
  position: relative;
  margin-inline: calc(-1 * #{space(3)});
  display: flex;
  align-items: center;
  gap: space(3);
  border-radius: var(--radius-lg);
  padding: space(2) space(3);
  @include transition-colors;

  &:hover,
  &:focus-within {
    background-color: token(surface-container);
  }

  @include from(md) {
    gap: space(4);
  }

  &--large {
    padding-block: space(3);

    @include from(md) {
      gap: space(6);
    }
  }
}

.chart-row__rank {
  display: flex;
  width: space(7);
  flex-shrink: 0;
  justify-content: flex-end;
  @include type(body-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: token(on-surface-variant);

  // Podium numerals: display-sized, tight.
  .chart-row--large & {
    width: space(8);
    font-size: 2rem;
    line-height: 1;
    letter-spacing: -0.04em;
    font-weight: 800;
    color: token(on-surface);

    @include from(md) {
      width: space(16);
      font-size: 3.5rem;
    }
  }
}

.chart-row__movement {
  display: flex;
  width: space(9);
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  @include type(body-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  @include from(md) {
    width: space(12);
  }
}

.movement-new {
  @include type(label-caps);
  text-transform: uppercase;
  color: token(primary);
}

.movement-icon {
  @include icon-size(base);
}

.movement--up {
  color: token(on-surface);
}

.movement--muted {
  color: token(on-surface-variant);
}

.movement--flat {
  color: token(outline);
}

.chart-row__cover {
  flex-shrink: 0;
  width: space(12);
  height: space(12);
  border-radius: var(--radius-md);

  .chart-row--large & {
    width: space(16);
    height: space(16);
    border-radius: var(--radius-lg);

    @include from(md) {
      width: space(24);
      height: space(24);
    }
  }
}

.chart-row__text {
  min-width: 0;
  flex: 1 1 0%;
}

.chart-row__title {
  display: block;
  font-weight: 600;
  color: token(on-surface);
  @include truncate;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-lg);
  }

  .chart-row--large & {
    @include line-clamp(2);
    // Matches the shipped look: `display: block` still wins over the clamp's
    // -webkit-box, so long titles wrap instead of clamping. Drop this line to
    // enable the 2-line clamp.
    display: block;
    text-overflow: clip;
    white-space: normal;
    @include size(lg);

    @include from(md) {
      @include type(headline-md);
    }
  }
}

.chart-row__artist {
  @include truncate;
  @include type(body-sm);
  color: token(on-surface-variant);
}

.chart-row__duration {
  display: none;
  @include type(body-sm);
  font-variant-numeric: tabular-nums;
  color: token(on-surface-variant);

  @include from(sm) {
    display: block;
  }
}
</style>
