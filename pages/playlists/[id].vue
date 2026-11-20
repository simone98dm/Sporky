<template>
  <div class="playlist-page">
    <NuxtLink to="/playlists" class="back-link">
      <span aria-hidden="true" class="material-symbols-outlined back-link__icon"
        >arrow_back</span
      >
      All playlists
    </NuxtLink>

    <ErrorMessage
      v-if="errorMessage"
      title="Couldn't load this playlist"
      :message="errorMessage"
      :show-retry="errorAction !== 'none'"
      :retry-label="errorAction === 'login' ? 'Log in again' : 'Try again'"
      @retry="errorAction === 'login' ? store.login() : retry()"
    />

    <template v-else>
      <!-- Hero: the cover bleeds into the background, as on Home -->
      <header v-if="playlist" class="playlist-hero">
        <ArtworkBackdrop :src="playlist.cover" overlay="bottom" eager />
        <div class="playlist-hero__body">
          <TrackArtwork
            :src="playlist.cover"
            loading="eager"
            class="playlist-hero__cover"
          />
          <div class="playlist-hero__text">
            <h1 class="playlist-hero__title">
              {{ playlist.name }}
            </h1>
            <p v-if="playlist.description" class="playlist-hero__description">
              {{ playlist.description }}
            </p>
            <p class="playlist-hero__meta">
              <span class="playlist-hero__owner">{{ playlist.owner }}</span>
              <template v-if="!isLoadingSongs">
                · {{ pluralize(songs.length, 'song') }}</template
              >
            </p>
          </div>
        </div>
      </header>
      <div
        v-else
        class="skeleton playlist-hero-skeleton"
        aria-hidden="true"
      ></div>

      <div class="playlist-layout">
        <!-- Export first on small screens (no scrolling past 300 songs to
             reach it); a sticky side column on desktop. -->
        <div class="playlist-layout__aside">
          <PlaylistExportPanel
            v-if="playlist && !isLoadingSongs"
            :playlist-name="playlist.name"
            :songs="songs"
          />
          <div v-else class="skeleton export-skeleton" aria-hidden="true"></div>
          <p v-if="skipped" class="skipped-note">
            {{ skipped }} {{ skipped === 1 ? 'item isn’t' : 'items aren’t' }}
            included: podcast episodes and tracks removed from Spotify have no
            song details.
          </p>
        </div>

        <section aria-labelledby="songs-title" class="playlist-layout__songs">
          <h2 id="songs-title" class="sr-only">Songs</h2>

          <div v-if="isLoadingSongs" aria-busy="true">
            <span class="sr-only" role="status">{{ loadingLabel }}</span>
            <p aria-hidden="true" class="songs-progress">
              {{ loadingLabel }}
            </p>
            <div class="songs-skeleton">
              <div
                v-for="n in 8"
                :key="n"
                class="skeleton songs-skeleton__row"
              ></div>
            </div>
          </div>

          <div v-else-if="songs.length" class="songs-header" aria-hidden="true">
            <span class="songs-header__rank">#</span>
            <span>Title</span>
            <span>Album</span>
          </div>

          <ol v-if="!isLoadingSongs && songs.length" class="songs">
            <li v-for="(song, i) in songs" :key="i" class="song">
              <span aria-hidden="true" class="song__rank">{{ i + 1 }}</span>
              <div class="song__text">
                <p class="song__title" :title="song.title">
                  {{ song.title }}
                </p>
                <p class="song__artist">
                  {{ song.artist || 'Unknown artist'
                  }}<span v-if="song.album" class="song__inline-album">
                    · {{ song.album }}</span
                  >
                </p>
              </div>
              <p class="song__album" :title="song.album">
                {{ song.album }}
              </p>
            </li>
          </ol>

          <EmptyState
            v-else-if="!isLoadingSongs"
            icon="queue_music"
            title="Nothing to back up"
          >
            This playlist has no songs yet.
          </EmptyState>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { pluralize } from '~/utils/common';
import { useSporky } from '~/stores/sporky';

const route = useRoute();
const store = useSporky();
const {
  playlist,
  songs,
  skipped,
  progress,
  isLoadingSongs,
  errorMessage,
  errorAction,
  retry,
} = usePlaylist(String(route.params.id));

const numberFormat = new Intl.NumberFormat('en-US');

const loadingLabel = computed(() =>
  progress.value
    ? `Loading ${numberFormat.format(progress.value.loaded)} of ${numberFormat.format(progress.value.total)} songs…`
    : 'Loading playlist…',
);

useHead({
  title: computed(() =>
    playlist.value ? `${playlist.value.name} · Backup` : 'Playlist Backup',
  ),
});
</script>

<style scoped lang="scss">
// Rank, title/artist, album: shared by the header row and every song.
$song-columns: 2.5rem minmax(0, 1fr) minmax(0, 1fr);

.playlist-page {
  margin: space(6) auto 0;
  display: flex;
  max-width: 72rem;
  flex-direction: column;
  gap: space(8);

  @include from(md) {
    margin-top: space(10);
  }
}

.back-link {
  display: inline-flex;
  min-height: space(11);
  width: fit-content;
  align-items: center;
  gap: space(2);
  color: token(on-surface-variant);
  @include transition-colors;

  &:hover {
    color: token(on-surface);
  }
}

.back-link__icon {
  @include icon-size(xl);
  @include transition(transform);

  .back-link:hover & {
    transform: translateX(-#{space(1)});
  }
}

// ── Hero: the cover bleeds into the background, as on Home ───────────
.playlist-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background-color: token(surface-container-low);
  // The sidebar narrows the content column at md, so the cover sits beside
  // the title only when the hero itself has room for both.
  container-type: inline-size;
}

.playlist-hero__body {
  display: flex;
  flex-direction: column;
  gap: space(5);
  padding: space(6);

  @container (min-width: 36rem) {
    flex-direction: row;
    align-items: flex-end;
  }

  @include from(md) {
    gap: space(8);
    padding: space(10);
  }
}

.playlist-hero__cover {
  aspect-ratio: 1 / 1;
  width: space(32);
  flex-shrink: 0;
  border-radius: var(--radius-xl);
  box-shadow: $shadow-art;

  @include from(md) {
    width: space(48);
  }
}

.playlist-hero__text {
  min-width: 0;
}

.playlist-hero__title {
  margin-bottom: space(3);
  @include line-clamp(2);
  overflow-wrap: break-word;
  @include type(display-lg-mobile);
  color: token(on-surface);

  @include from(md) {
    @include type(display-lg);
  }
}

.playlist-hero__description {
  margin-bottom: space(2);
  @include line-clamp(2);
  max-width: 42rem;
  @include type(body-sm);
  color: token(on-surface-variant);
}

.playlist-hero__meta {
  @include type(body-sm);
  color: token(on-surface-variant);
}

.playlist-hero__owner {
  font-weight: 600;
  color: token(on-surface);
}

.playlist-hero-skeleton {
  height: space(56);
  border-radius: var(--radius-lg);

  @include from(md) {
    height: space(64);
  }
}

// ── Songs + export: export first on small screens, a sticky side column
//    on desktop. ─────────────────────────────────────────────────────────
.playlist-layout {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  align-items: flex-start;
  gap: space(8);

  @include from(lg) {
    grid-template-columns: minmax(0, 1fr) 22rem;
  }
}

.playlist-layout__aside {
  @include from(lg) {
    position: sticky;
    top: space(24);
    order: 9999;
  }
}

.playlist-layout__songs {
  min-width: 0;
}

.export-skeleton {
  height: space(96);
  border-radius: var(--radius-xl);
}

.skipped-note {
  margin-top: space(3);
  padding-inline: space(2);
  @include type(body-sm);
  color: token(on-surface-variant);
}

.songs-progress {
  margin-bottom: space(3);
  padding-inline: space(3);
  @include type(body-sm);
  font-variant-numeric: tabular-nums;
  color: token(on-surface-variant);
}

.songs-skeleton {
  display: flex;
  flex-direction: column;
  gap: space(2);
}

.songs-skeleton__row {
  height: space(14);
  border-radius: var(--radius-lg);
}

.songs-header {
  margin-bottom: space(1);
  display: none;
  grid-template-columns: $song-columns;
  gap: space(4);
  border-bottom-width: 1px;
  border-color: token(hairline);
  padding: 0 space(3) space(3);
  @include type(label-caps);
  text-transform: uppercase;
  color: token(on-surface-variant);

  @include from(md) {
    display: grid;
  }
}

.songs-header__rank {
  text-align: right;
}

.songs {
  display: flex;
  flex-direction: column;
}

.song {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  align-items: center;
  gap: space(4);
  border-radius: var(--radius-lg);
  padding: space(2.5) space(3);
  @include transition-colors;

  &:hover {
    background-color: token(surface-container-low);
  }

  @include from(md) {
    grid-template-columns: $song-columns;
  }
}

.song__rank {
  text-align: right;
  @include type(body-sm);
  font-variant-numeric: tabular-nums;
  color: token(on-surface-variant);
}

.song__text {
  min-width: 0;
}

.song__title {
  @include truncate;
  font-weight: 600;
  color: token(on-surface);
}

.song__artist {
  @include truncate;
  @include type(body-sm);
  color: token(on-surface-variant);
}

.song__inline-album {
  @include from(md) {
    display: none;
  }
}

.song__album {
  display: none;
  @include truncate;
  @include type(body-sm);
  color: token(on-surface-variant);

  @include from(md) {
    display: block;
  }
}
</style>
