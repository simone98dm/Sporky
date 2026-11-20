<template>
  <TrackArtwork
    :src="src"
    aria-hidden="true"
    :loading="eager ? 'eager' : undefined"
    :fetchpriority="fetchpriority"
    :class="['backdrop', `backdrop--${intensity}`]"
  />
  <div
    v-if="overlay !== 'none'"
    :class="['backdrop-overlay', `backdrop-overlay--${overlay}`]"
  ></div>
</template>

<script setup lang="ts">
type Overlay = 'bottom' | 'side' | 'none';
type Intensity = 'soft' | 'medium' | 'strong';

interface ArtworkBackdropProps {
  src?: string;
  overlay?: Overlay;
  intensity?: Intensity;
  eager?: boolean;
  fetchpriority?: 'high' | 'low' | 'auto';
}

// The parent is `position: relative; isolation: isolate; overflow: hidden`
// so the negative z-index layers stay inside it.
const {
  src,
  overlay = 'bottom',
  intensity = 'medium',
  eager = false,
  fetchpriority,
} = defineProps<ArtworkBackdropProps>();
</script>

<style scoped lang="scss">
.backdrop,
.backdrop-overlay {
  position: absolute;
  inset: 0;
  z-index: -10;
}

// The cover, blown up and blurred into a colour field.
.backdrop {
  width: 100%;
  height: 100%;
  transform: scale(var(--backdrop-scale));
  opacity: var(--backdrop-opacity);
  filter: blur(var(--backdrop-blur)) saturate(1.5);

  &--soft {
    --backdrop-scale: 1.5;
    --backdrop-opacity: 0.35;
    --backdrop-blur: 40px;
  }

  &--medium {
    --backdrop-scale: 1.25;
    --backdrop-opacity: 0.5;
    --backdrop-blur: 64px;
  }

  &--strong {
    --backdrop-scale: 1.25;
    --backdrop-opacity: 0.6;
    --backdrop-blur: 64px;
  }
}

// Fades the colour field into the canvas so text stays legible.
.backdrop-overlay {
  &--bottom {
    background-image: linear-gradient(
      to top,
      token(background),
      alpha(background, 70%),
      alpha(background, 20%)
    );
  }

  &--side {
    background-image: linear-gradient(
      to right,
      alpha(background, 90%),
      alpha(background, 60%),
      alpha(background, 30%)
    );
  }
}
</style>
