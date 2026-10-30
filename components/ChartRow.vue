<template>
  <li
    :class="[
      'group relative -mx-3 flex items-center rounded-lg px-3 transition-colors focus-within:bg-surface-container hover:bg-surface-container',
      large ? 'gap-3 py-3 md:gap-6' : 'gap-3 py-2 md:gap-4',
    ]"
  >
    <!-- Rank (visual only; the <ol> and the link text carry it for AT) -->
    <span
      aria-hidden="true"
      :class="[
        'flex shrink-0 justify-end font-extrabold tabular-nums',
        large
          ? 'w-8 text-[2rem] leading-none tracking-[-0.04em] text-on-surface md:w-16 md:text-[3.5rem]'
          : 'w-7 text-body-lg font-semibold text-on-surface-variant',
      ]"
    >
      <EqualizerBars v-if="playing" playing />
      <template v-else>{{ rank }}</template>
    </span>

    <!-- Movement vs the baseline range (visual; the link text carries it) -->
    <span
      v-if="movement !== undefined"
      aria-hidden="true"
      class="flex w-9 shrink-0 items-center justify-center text-body-sm font-semibold tabular-nums md:w-12"
    >
      <span
        v-if="movement === 'new'"
        class="text-label-caps uppercase text-primary"
        >New</span
      >
      <span
        v-else-if="movement === 'fading'"
        class="material-symbols-outlined text-base text-on-surface-variant"
        title="Fading"
        >trending_down</span
      >
      <template v-else-if="typeof movement === 'number' && movement > 0">
        <span class="material-symbols-outlined text-base text-on-surface"
          >arrow_upward</span
        >
        <span class="text-on-surface">{{ movement }}</span>
      </template>
      <template v-else-if="typeof movement === 'number' && movement < 0">
        <span
          class="material-symbols-outlined text-base text-on-surface-variant"
          >arrow_downward</span
        >
        <span class="text-on-surface-variant">{{ -movement }}</span>
      </template>
      <span
        v-else-if="movement === 0"
        class="material-symbols-outlined text-base text-outline"
        >remove</span
      >
    </span>

    <TrackArtwork
      :src="track.cover"
      :class="[
        'shrink-0',
        large ? 'h-16 w-16 rounded-lg md:h-24 md:w-24' : 'h-12 w-12 rounded-md',
      ]"
    />

    <!-- Title link; its ::after stretches over the whole row. The sr-only
         prefix stays before the title: after a truncated title it would sit
         off-screen and widen the page. -->
    <div class="min-w-0 flex-1">
      <NuxtLink
        :to="`/track/${track.id}`"
        :title="track.name"
        :class="[
          'block font-semibold after:absolute after:inset-0 after:rounded-lg after:content-[\'\']',
          large ? 'line-clamp-2 text-lg md:text-headline-md' : 'truncate',
          playing ? 'text-primary' : 'text-on-surface',
        ]"
      >
        <span class="sr-only"
          >Number {{ rank
          }}{{ movementLabel ? `, ${movementLabel}` : '' }}: </span
        >{{ track.name }}
      </NuxtLink>
      <p class="truncate text-body-sm text-on-surface-variant">
        {{ artistNames }}
      </p>
    </div>

    <span
      class="hidden text-body-sm text-on-surface-variant tabular-nums sm:block"
    >
      {{ formatTime(track.duration / 1000) }}
    </span>

    <button
      v-if="track.preview"
      type="button"
      class="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
      :aria-label="`${playing ? 'Pause' : 'Play'} preview of ${track.name}`"
      @click="player.toggle(track)"
    >
      <span aria-hidden="true" class="material-symbols-outlined fill">
        {{ playing ? 'pause' : 'play_arrow' }}
      </span>
    </button>
    <span v-else class="w-11 shrink-0">
      <span class="sr-only">No preview available</span>
    </span>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Movement, Track } from '~/types';
import { useAudioPlayer } from '~/composables/useAudioPlayer';
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

const player = useAudioPlayer();
const playing = computed(
  () => player.isCurrent(track.id) && player.isPlaying.value,
);

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
