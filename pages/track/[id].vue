<template>
  <div class="ambient-glow track-page">
    <main class="track-page__main">
      <!-- Top bar -->
      <header class="track-page__header">
        <NuxtLink to="/tracks" class="back-link">
          <span
            aria-hidden="true"
            class="material-symbols-outlined back-link__icon"
            >arrow_back</span
          >
          <span class="back-link__label">Back to Library</span>
        </NuxtLink>
        <span class="quality-badge">HQ AUDIO</span>
      </header>

      <div v-if="track" class="track-grid">
        <!-- Left: artwork + meta -->
        <div class="track-grid__column track-grid__column--art">
          <div class="cover">
            <img
              :src="track.cover"
              :alt="`${track.name} artwork`"
              class="cover__image"
            />
          </div>

          <div class="glass-panel track-meta">
            <h1 class="track-meta__title">
              {{ track.name }}
            </h1>
            <p class="track-meta__artist">
              {{ artistNames }}
            </p>
            <div class="track-meta__chips">
              <span class="chip">{{ track.album }}</span>
              <span class="chip">{{ formatTime(track.duration / 1000) }}</span>
            </div>
          </div>
        </div>

        <!-- Right: waveform + analytics -->
        <div class="track-grid__column track-grid__column--info">
          <!-- Listen panel (real Spotify deep link) -->
          <div class="glass-panel listen">
            <span
              aria-hidden="true"
              class="material-symbols-outlined listen__icon"
              >headphones</span
            >
            <p class="listen__text">Listen to the full track on Spotify.</p>
            <a
              :href="spotifyUrl"
              target="_blank"
              rel="noopener"
              class="spotify-link"
            >
              <svg
                class="spotify-link__logo"
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
          <div class="stats">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="glass-panel stat"
            >
              <div class="stat__header">
                <span class="stat__label">{{ stat.label }}</span>
                <span
                  aria-hidden="true"
                  class="material-symbols-outlined stat__icon"
                  >{{ stat.icon }}</span
                >
              </div>
              <div class="stat__value">
                {{ stat.value }}
              </div>
              <div class="stat__track">
                <div class="stat__bar" :style="{ width: `${stat.pct}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- More from the artist (opens in Spotify: these usually aren't in
           your charts, which is all this page can show) -->
      <section
        v-if="track && hasSuggestions"
        aria-labelledby="more-title"
        class="more"
      >
        <h2 id="more-title" class="more__title">More from {{ leadArtist }}</h2>
        <div v-if="isLoadingSuggestions" class="more__list" aria-busy="true">
          <span class="sr-only" role="status">Loading suggestions…</span>
          <div
            v-for="n in SUGGESTION_COUNT"
            :key="n"
            class="skeleton more__skeleton"
          ></div>
        </div>
        <ul v-else class="more__list">
          <li v-for="song in suggestions" :key="song.id">
            <a
              :href="`https://open.spotify.com/track/${song.id}`"
              target="_blank"
              rel="noopener"
              class="suggestion"
            >
              <TrackArtwork :src="song.cover" class="suggestion__cover" />
              <span class="suggestion__text">
                <span class="suggestion__name">{{ song.name }}</span>
                <span class="suggestion__album">{{ song.album }}</span>
              </span>
              <span
                aria-hidden="true"
                class="material-symbols-outlined suggestion__icon"
                >open_in_new</span
              >
              <span class="sr-only">(opens in Spotify)</span>
            </a>
          </li>
        </ul>
      </section>

      <!-- Not found -->
      <div v-else-if="!isLoading" class="not-found">
        <span
          aria-hidden="true"
          class="material-symbols-outlined not-found__icon"
          >music_off</span
        >
        <h2 class="not-found__title">Track not found</h2>
        <NuxtLink to="/tracks" class="not-found__link"
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
import { useSpotifyApi } from '~/composables/useSpotifyApi';
import { formatTime } from '~/utils/common';
import { mapTrackToSong } from '~/utils/mapper';
import { pickSuggestions } from '~/utils/suggestions';
import { SUGGESTION_COUNT } from '~/utils/const';

definePageMeta({ layout: false });

const route = useRoute();
const store = useSporky();
const { currentTracks, isLoading } = storeToRefs(store);

const trackId = computed(() => route.params.id as string);
const track = computed(() => store.getTrackById(trackId.value));

const artistNames = computed(() =>
  track.value?.artists.map((a) => a.name).join(', '),
);

const spotifyUrl = computed(() =>
  track.value ? `https://open.spotify.com/track/${track.value.id}` : '#',
);

// "More from {artist}": the artist's other songs, from Spotify search.
const { searchArtistTracks } = useSpotifyApi();
const leadArtist = computed<string | undefined>(
  () => track.value?.artists[0]?.name,
);
const { data: suggestions, pending: isLoadingSuggestions } = useAsyncData(
  () => `suggestions-${trackId.value}`,
  async () => {
    if (!track.value || !leadArtist.value) return [];
    const results = await searchArtistTracks(leadArtist.value);
    return pickSuggestions(
      results.map(mapTrackToSong),
      track.value,
      SUGGESTION_COUNT,
    );
  },
  // Client only, like the chart this page reads from. Optional content: on
  // error the section just doesn't render.
  { server: false, watch: [leadArtist], default: () => [] },
);
const hasSuggestions = computed(
  () => isLoadingSuggestions.value || suggestions.value.length > 0,
);

// Real Spotify metrics (audio-features endpoint is deprecated, so no
// energy/danceability/BPM — we surface the data the API still provides).
const stats = computed(() => {
  const t = track.value;
  if (!t) return [];
  const index = currentTracks.value.findIndex((x) => x.id === t.id);
  const total = currentTracks.value.length || 1;
  const popularity =
    t.popularity === undefined
      ? []
      : [
          {
            label: 'Popularity',
            icon: 'local_fire_department',
            value: `${t.popularity}%`,
            pct: t.popularity,
          },
        ];
  return [
    ...popularity,
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

onMounted(async () => {
  // Ensure the current range is loaded so the track resolves.
  if (currentTracks.value.length === 0) {
    await store.getTopTracks();
  }
});
</script>

<style scoped lang="scss">
@mixin large-icon {
  @include icon-size('4xl');

  @include from(md) {
    @include icon-size('5xl');
  }
}

.track-page {
  position: relative;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  overflow-x: hidden;
  background-color: token(background);
}

.track-page__main {
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  flex: 1 1 0%;
  flex-direction: column;
  padding: var(--container-padding) var(--container-padding) space(32);

  @include from(lg) {
    padding: var(--section-margin) var(--section-margin) space(32);
  }
}

.track-page__header {
  margin-bottom: var(--section-margin);
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.back-link {
  display: flex;
  align-items: center;
  gap: var(--unit);
  color: token(on-surface-variant);
  @include transition-colors;

  &:hover {
    color: token(primary);
  }
}

.back-link__icon {
  @include icon-size(xl);
  @include transition(transform);

  .back-link:hover & {
    transform: translateX(-#{space(1)});
  }
}

.back-link__label {
  @include type(body-lg);
}

.quality-badge,
.chip {
  border-radius: var(--radius-full);
  padding: space(1) space(3);
  @include type(label-caps);
  color: token(on-surface-variant);
}

.quality-badge {
  border: 1px solid token(outline);
}

.chip {
  background-color: token(surface-variant);
}

.track-grid {
  display: grid;
  flex: 1 1 0%;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: var(--card-gap);

  @include from(lg) {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
}

.track-grid__column {
  display: flex;
  flex-direction: column;
  gap: var(--card-gap);

  @include from(lg) {
    &--art {
      grid-column: span 5 / span 5;
    }

    &--info {
      grid-column: span 7 / span 7;
    }
  }
}

// ── Artwork with a hover play overlay ─────────────────────────────────
.cover {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.5);
}

.cover__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  @include transition(transform, 700ms);

  .cover:hover & {
    transform: scale(1.05);
  }
}

.track-meta {
  display: flex;
  flex-direction: column;
  gap: var(--unit);
  border-radius: var(--radius-xl);
  padding: var(--container-padding);
}

.track-meta__title {
  @include truncate;
  @include type(display-lg-mobile);
  color: token(on-surface);

  @include from(lg) {
    @include type(display-lg);
  }
}

.track-meta__artist {
  @include type(headline-md);
  color: token(on-surface-variant);
}

.track-meta__chips {
  margin-top: space(2);
  display: flex;
  flex-wrap: wrap;
  gap: space(3);
}

// ── Listen panel and stats ────────────────────────────────────────────
.listen {
  display: flex;
  min-height: 300px;
  flex: 1 1 0%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: space(4);
  border-radius: var(--radius-xl);
  padding: var(--container-padding);
  text-align: center;
}

.listen__icon {
  @include large-icon;
  color: token(primary);
}

.listen__text {
  max-width: 24rem;
  @include type(body-lg);
  color: token(on-surface-variant);
}

.spotify-link {
  display: flex;
  align-items: center;
  gap: space(3);
  border-radius: var(--radius-full);
  background-color: token(primary-container);
  padding: space(3) space(6);
  font-weight: 700;
  color: token(on-primary-container);
  @include transition-colors;

  &:hover {
    background-color: token(primary-fixed-dim);
    color: token(on-primary);
  }
}

.spotify-link__logo {
  width: space(5);
  height: space(5);
}

.stats {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: var(--gutter);

  // One equal column per stat (Popularity isn't always available).
  @include from(md) {
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
  }
}

.stat {
  display: flex;
  flex-direction: column;
  gap: space(2);
  border-radius: var(--radius-lg);
  padding: var(--gutter);
}

.stat__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: token(on-surface-variant);
}

.stat__label {
  @include type(body-sm);
}

.stat__icon {
  @include icon-size(base);
}

.stat__value {
  @include type(headline-md);
  color: token(on-surface);
}

.stat__track {
  margin-top: space(1);
  height: space(2);
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-full);
  background-color: token(surface-container-high);
}

.stat__bar {
  height: 100%;
  border-radius: var(--radius-full);
  background-color: token(primary);
}

// ── More from the artist ──────────────────────────────────────────────
.more {
  margin-top: var(--section-margin);
}

.more__title {
  margin-bottom: space(4);
  @include type(headline-md);
  color: token(on-surface);
}

// As many ~18rem columns as fit; one column on phones. The negative margin
// keeps covers aligned with the heading despite each row's hover padding.
.more__list {
  margin-inline: calc(-1 * #{space(2)});
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: space(2) var(--gutter);
}

.more__skeleton {
  height: space(18);
  border-radius: var(--radius-lg);
}

.suggestion {
  display: flex;
  align-items: center;
  gap: space(3);
  border-radius: var(--radius-lg);
  padding: space(2);
  color: token(on-surface-variant);
  @include transition-colors;

  &:hover {
    background-color: token(surface-container-high);
    color: token(on-surface);
  }
}

.suggestion__cover {
  width: space(14);
  height: space(14);
  flex-shrink: 0;
  border-radius: var(--radius-md);
}

.suggestion__text {
  display: flex;
  min-width: 0;
  flex: 1 1 0%;
  flex-direction: column;
}

.suggestion__name {
  @include truncate;
  font-weight: 600;
  color: token(on-surface);
}

.suggestion__album {
  @include truncate;
  @include type(body-sm);
}

.suggestion__icon {
  @include icon-size(xl);
}

// ── Not found ─────────────────────────────────────────────────────────
.not-found {
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.not-found__icon {
  margin-bottom: space(4);
  @include large-icon;
  color: token(on-surface-variant);
}

.not-found__title {
  margin-bottom: space(2);
  @include type(headline-md);
  color: token(on-surface);
}

.not-found__link {
  color: token(primary);

  &:hover {
    text-decoration-line: underline;
  }
}
</style>
