<template>
  <section class="empty-state layer-1">
    <span
      aria-hidden="true"
      class="material-symbols-outlined empty-state__icon"
      >{{ icon }}</span
    >
    <h2 class="empty-state__title">{{ title }}</h2>
    <p class="empty-state__text">
      <slot />
    </p>
  </section>
</template>

<script setup lang="ts">
interface EmptyStateProps {
  icon: string;
  title: string;
}

defineProps<EmptyStateProps>();
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xl);
  padding-block: space(16);
  text-align: center;
}

.empty-state__icon {
  margin-bottom: space(4);
  color: token(on-surface-variant);
  @include icon-size('4xl');

  @include from(md) {
    @include icon-size('5xl');
  }
}

.empty-state__title {
  margin-bottom: space(2);
  @include type(headline-md);
  color: token(on-surface);
}

.empty-state__text {
  max-width: 28rem;
  @include type(body-sm);
  color: token(on-surface-variant);
}
</style>
