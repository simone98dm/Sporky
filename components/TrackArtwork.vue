<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="alt"
    class="artwork"
    loading="lazy"
    decoding="async"
    @error="failed = true"
  />
  <div
    v-else
    role="img"
    :aria-label="alt || undefined"
    :aria-hidden="alt ? undefined : 'true'"
    class="artwork artwork--empty"
  >
    <span aria-hidden="true" class="material-symbols-outlined">music_note</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface TrackArtworkProps {
  src?: string;
  alt?: string;
}

const { src, alt = '' } = defineProps<TrackArtworkProps>();

// Missing or broken covers fall back to a neutral tile instead of a broken image.
const failed = ref(false);
</script>

<style scoped lang="scss">
// Size, radius and shadow come from the parent's class on this root.
.artwork {
  object-fit: cover;
}

// Missing cover: a neutral tile with a note glyph.
.artwork--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: token(surface-container-high);
  color: token(on-surface-variant);
}
</style>
