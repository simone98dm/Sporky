<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="alt"
    class="object-cover"
    loading="lazy"
    decoding="async"
    @error="failed = true"
  />
  <div
    v-else
    role="img"
    :aria-label="alt || undefined"
    :aria-hidden="alt ? undefined : 'true'"
    class="flex items-center justify-center bg-surface-container-high text-on-surface-variant"
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
