<template>
  <div class="backup">
    <header class="backup__header">
      <div>
        <h1 class="backup__title">Playlist Backup</h1>
        <p class="backup__lead">
          Save a copy of any playlist as CSV, JSON or plain text. Pick one to
          see its songs.
        </p>
      </div>

      <label v-if="playlists.length > SEARCH_THRESHOLD" class="search">
        <span class="sr-only">Filter playlists</span>
        <span aria-hidden="true" class="material-symbols-outlined search__icon"
          >search</span
        >
        <input
          v-model="query"
          type="search"
          placeholder="Filter playlists"
          class="search__input"
        />
      </label>
    </header>

    <!-- Debounced so screen readers don't announce every keystroke. -->
    <p class="sr-only" aria-live="polite">{{ announcedCount }}</p>

    <ErrorMessage
      v-if="errorMessage"
      title="Couldn't load your playlists"
      :message="errorMessage"
      :show-retry="true"
      :retry-label="errorAction === 'login' ? 'Log in again' : 'Try again'"
      @retry="errorAction === 'login' ? store.login() : refresh()"
    />

    <div v-else-if="isLoading" class="playlist-grid" aria-busy="true">
      <span class="sr-only" role="status">Loading your playlists…</span>
      <div v-for="n in 10" :key="n" class="playlist-skeleton">
        <div class="skeleton playlist-skeleton__cover"></div>
        <div class="skeleton playlist-skeleton__line"></div>
        <div
          class="skeleton playlist-skeleton__line playlist-skeleton__line--short"
        ></div>
      </div>
    </div>

    <template v-else-if="playlists.length">
      <p class="backup__count" aria-hidden="true">
        {{ countLabel }}
      </p>

      <ul v-if="filtered.length" class="playlist-grid">
        <li v-for="playlist in filtered" :key="playlist.id">
          <NuxtLink :to="`/playlists/${playlist.id}`" class="playlist-card">
            <TrackArtwork :src="playlist.cover" class="playlist-card__cover" />
            <div class="playlist-card__text">
              <p class="playlist-card__name" :title="playlist.name">
                {{ playlist.name }}
              </p>
              <p class="playlist-card__meta">
                {{ pluralize(playlist.trackCount, 'song') }} ·
                {{ playlist.owner }}
              </p>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <p v-else class="backup__no-match">No playlists match “{{ query }}”.</p>
    </template>

    <EmptyState v-else icon="library_music" title="No playlists yet">
      Playlists you create or follow on Spotify will show up here, ready to back
      up.
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { pluralize } from '~/utils/common';
import { useSporky } from '~/stores/sporky';

// Below this many playlists, filtering is more noise than help.
const SEARCH_THRESHOLD = 12;
const ANNOUNCE_DEBOUNCE_MS = 400;

const store = useSporky();
const { playlists, isLoading, errorMessage, errorAction, refresh } =
  usePlaylists();
const query = ref('');

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return playlists.value;
  return playlists.value.filter(
    (p) =>
      p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q),
  );
});

const countLabel = computed(() => {
  const total = pluralize(playlists.value.length, 'playlist');
  return query.value.trim() ? `${filtered.value.length} of ${total}` : total;
});

const announcedCount = ref('');
let announceTimer: ReturnType<typeof setTimeout> | undefined;
watch(
  countLabel,
  (label) => {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      announcedCount.value = label;
    }, ANNOUNCE_DEBOUNCE_MS);
  },
  { immediate: true },
);
onBeforeUnmount(() => clearTimeout(announceTimer));
</script>

<style scoped lang="scss">
.backup {
  margin: space(6) auto 0;
  display: flex;
  max-width: 72rem;
  flex-direction: column;
  gap: space(8);

  @include from(md) {
    margin-top: space(10);
  }
}

.backup__header {
  display: flex;
  flex-direction: column;
  gap: space(6);

  @include from(md) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.backup__title {
  margin-bottom: space(2);
  @include type(display-lg-mobile);
  color: token(on-surface);

  @include from(md) {
    @include type(display-lg);
  }
}

.backup__lead {
  max-width: 36rem;
  @include type(body-lg);
  color: token(on-surface-variant);
}

.backup__count {
  @include type(label-caps);
  text-transform: uppercase;
  color: token(on-surface-variant);
}

.backup__no-match {
  padding-block: space(12);
  text-align: center;
  @include type(body-lg);
  color: token(on-surface-variant);
}

// ── Filter field ──────────────────────────────────────────────────────
.search {
  position: relative;
  display: block;

  @include from(md) {
    width: space(72);
  }
}

.search__icon {
  pointer-events: none;
  position: absolute;
  left: space(4);
  top: 50%;
  transform: translateY(-50%);
  @include icon-size(xl);
  color: token(on-surface-variant);
}

.search__input {
  min-height: space(11);
  width: 100%;
  border: 1px solid token(hairline);
  border-radius: var(--radius-full);
  background-color: token(surface-container-low);
  padding: space(2) space(4) space(2) space(12);
  @include type(body-sm);
  color: token(on-surface);

  &::placeholder {
    color: token(on-surface-variant);
  }

  &:focus {
    border-color: alpha(primary, 60%);
  }
}

// ── Grid of playlists ─────────────────────────────────────────────────
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: space(8) space(4);

  @include from(sm) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @include from(lg) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @include from(xl) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.playlist-skeleton {
  display: flex;
  flex-direction: column;
  gap: space(3);
}

.playlist-skeleton__cover {
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
}

.playlist-skeleton__line {
  height: space(4);
  width: 75%;
  border-radius: var(--radius);

  &--short {
    height: space(3);
    width: 50%;
  }
}

// The cover lifts on hover and keyboard focus.
.playlist-card {
  margin: calc(-1 * #{space(2)});
  display: flex;
  flex-direction: column;
  gap: space(3);
  border-radius: var(--radius-lg);
  padding: space(2);
  @include transition-colors;

  &:hover {
    background-color: token(surface-container-low);
  }
}

.playlist-card__cover {
  aspect-ratio: 1 / 1;
  width: 100%;
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 32px -12px rgb(0 0 0 / 0.7);
  @include transition(transform, 300ms);
  transition-timing-function: $ease-out;

  .playlist-card:hover &,
  .playlist-card:focus-visible & {
    transform: translateY(-#{space(1)});
  }
}

.playlist-card__text {
  min-width: 0;
}

.playlist-card__name {
  @include truncate;
  font-weight: 600;
  color: token(on-surface);
}

.playlist-card__meta {
  @include truncate;
  @include type(body-sm);
  color: token(on-surface-variant);
}
</style>
