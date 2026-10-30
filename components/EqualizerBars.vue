<template>
  <span aria-hidden="true" class="equalizer" :class="{ 'is-playing': playing }">
    <span v-for="n in 4" :key="n" class="equalizer-bar"></span>
  </span>
</template>

<script setup lang="ts">
interface EqualizerBarsProps {
  playing?: boolean;
}

const { playing = false } = defineProps<EqualizerBarsProps>();
</script>

<style scoped>
.equalizer {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}
.equalizer-bar {
  width: 3px;
  height: 100%;
  border-radius: 1px;
  background: theme('colors.primary');
  transform-origin: bottom;
  transform: scaleY(0.35);
}
.is-playing .equalizer-bar {
  animation: eq 0.9s cubic-bezier(0.16, 1, 0.3, 1) infinite alternate;
}
.is-playing .equalizer-bar:nth-child(2) {
  animation-duration: 0.7s;
  animation-delay: -0.3s;
}
.is-playing .equalizer-bar:nth-child(3) {
  animation-duration: 1.1s;
  animation-delay: -0.5s;
}
.is-playing .equalizer-bar:nth-child(4) {
  animation-duration: 0.8s;
  animation-delay: -0.2s;
}
@keyframes eq {
  from {
    transform: scaleY(0.25);
  }
  to {
    transform: scaleY(1);
  }
}
/* Static, still-readable "playing" state when motion is reduced. */
@media (prefers-reduced-motion: reduce) {
  .is-playing .equalizer-bar {
    animation: none;
  }
  .is-playing .equalizer-bar:nth-child(odd) {
    transform: scaleY(0.9);
  }
  .is-playing .equalizer-bar:nth-child(even) {
    transform: scaleY(0.55);
  }
}
</style>
