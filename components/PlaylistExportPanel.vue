<template>
  <section aria-labelledby="export-title" class="export-panel layer-1">
    <h2 id="export-title" class="export-panel__title">
      Back up {{ pluralize(songs.length, 'song') }}
    </h2>

    <fieldset class="export-panel__formats">
      <legend class="export-panel__label export-panel__label--legend">
        Format
      </legend>
      <label
        v-for="option in EXPORT_FORMATS"
        :key="option.value"
        :class="['format-option', { 'is-selected': format === option.value }]"
      >
        <input
          v-model="format"
          type="radio"
          name="export-format"
          :value="option.value"
          class="sr-only"
        />
        <span
          aria-hidden="true"
          class="material-symbols-outlined format-option__marker"
          :class="{ fill: format === option.value }"
          >{{
            format === option.value
              ? 'radio_button_checked'
              : 'radio_button_unchecked'
          }}</span
        >
        <span class="format-option__text">
          <span class="format-option__name">{{ option.label }}</span>
          <span class="format-option__hint">{{ option.hint }}</span>
        </span>
        <span class="format-option__ext">.{{ option.value }}</span>
      </label>
    </fieldset>

    <!-- What the file will look like, so the choice is concrete -->
    <figure class="export-panel__preview">
      <figcaption class="export-panel__label">Preview</figcaption>
      <p class="sr-only">{{ previewDescription }}</p>
      <pre aria-hidden="true" class="export-panel__code">{{ preview }}</pre>
    </figure>

    <button
      type="button"
      class="export-panel__download"
      :disabled="!songs.length"
      @click="download"
    >
      <span
        aria-hidden="true"
        class="material-symbols-outlined export-panel__icon"
        >download</span
      >
      Download {{ formatLabel }}
    </button>

    <p class="export-panel__status" role="status">
      <template v-if="savedAs">
        <span
          aria-hidden="true"
          class="material-symbols-outlined fill export-panel__check"
          >check_circle</span
        >
        Downloaded {{ savedAs }}
      </template>
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PlaylistSong } from '~/types';
import { pluralize } from '~/utils/common';
import {
  EXPORT_FORMATS,
  downloadExport,
  serialize,
  toFileName,
  type ExportFormat,
} from '~/utils/playlistExport';

interface PlaylistExportPanelProps {
  playlistName: string;
  songs: readonly PlaylistSong[];
}

const { playlistName, songs } = defineProps<PlaylistExportPanelProps>();

// Lines shown in the preview box; the rest fades out.
const PREVIEW_LINES = 12;

const PREVIEW_DESCRIPTIONS: Record<ExportFormat, string> = {
  csv: 'CSV file with columns Title, Artist and Album, one row per song.',
  json: 'JSON file with the playlist name, export date and a list of songs with title, artist and album.',
  txt: 'Text file with one numbered line per song: artist, title and album.',
};

const format = ref<ExportFormat>('csv');
const savedAs = ref('');

const formatLabel = computed(
  () => EXPORT_FORMATS.find((f) => f.value === format.value)!.label,
);
// The real file, trimmed: header fields like trackCount stay accurate.
const preview = computed(() =>
  serialize(format.value, playlistName, songs)
    .split('\n')
    .slice(0, PREVIEW_LINES)
    .join('\n'),
);

const previewDescription = computed(() => PREVIEW_DESCRIPTIONS[format.value]);

watch(format, () => (savedAs.value = ''));

const download = () => {
  downloadExport(format.value, playlistName, songs);
  savedAs.value = toFileName(playlistName, format.value);
};
</script>

<style scoped lang="scss">
.export-panel {
  display: flex;
  flex-direction: column;
  gap: space(5);
  border-radius: var(--radius-lg);
  padding: space(5);

  @include from(md) {
    padding: space(6);
  }
}

.export-panel__title {
  @include type(headline-md);
  color: token(on-surface);
}

.export-panel__formats {
  display: flex;
  flex-direction: column;
  gap: space(2);
}

.export-panel__label {
  @include type(label-caps);
  text-transform: uppercase;
  color: token(on-surface-variant);

  &--legend {
    margin-bottom: space(2);
  }
}

// A radio card; the native input is visually hidden but keeps focus, so
// the card shows the focus ring through :has().
.format-option {
  display: flex;
  min-height: space(11);
  cursor: pointer;
  align-items: center;
  gap: space(3);
  border: 1px solid token(hairline);
  border-radius: var(--radius-lg);
  padding: space(3) space(4);
  @include transition-colors;

  &:hover {
    background-color: token(surface-container-high);
  }

  &.is-selected {
    border-color: alpha(primary, 50%);
    background-color: alpha(primary-container, 15%);
  }

  &:has(:focus-visible) {
    outline: 2px solid token(primary);
  }
}

.format-option__marker {
  @include icon-size(xl);
  color: token(on-surface-variant);

  .is-selected & {
    color: token(primary);
  }
}

.format-option__text {
  display: flex;
  min-width: 0;
  flex: 1 1 0%;
  flex-direction: column;
}

.format-option__name {
  font-weight: 600;
  color: token(on-surface);
}

.format-option__hint {
  @include type(body-sm);
  color: token(on-surface-variant);
}

.format-option__ext {
  @include type(label-caps);
  text-transform: uppercase;
  color: token(outline);
}

.export-panel__preview {
  display: flex;
  flex-direction: column;
  gap: space(2);
}

// The first lines of the real file, fading out at the bottom.
.export-panel__code {
  max-height: space(48);
  overflow: hidden;
  white-space: pre;
  border-radius: var(--radius-lg);
  background-color: token(surface-container-lowest);
  padding: space(4);
  font-family: var(--font-mono);
  @include size(xs);
  line-height: 1.25rem;
  color: token(on-surface-variant);
  mask-image: linear-gradient(to bottom, black 70%, transparent);
}

.export-panel__download {
  display: inline-flex;
  min-height: space(12);
  align-items: center;
  justify-content: center;
  gap: space(2);
  border-radius: var(--radius-full);
  background-color: token(primary-container);
  padding-inline: space(6);
  font-weight: 700;
  color: token('white');
  @include transition((transform, background-color));

  &:hover {
    background-color: token(inverse-primary);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.export-panel__icon {
  @include icon-size(xl);
}

.export-panel__status {
  margin-top: calc(-1 * #{space(2)});
  min-height: space(5);
  @include truncate;
  text-align: center;
  @include type(body-sm);
  color: token(on-surface-variant);
}

.export-panel__check {
  vertical-align: -0.2em;
  @include icon-size(base);
  color: token(primary);
}
</style>
