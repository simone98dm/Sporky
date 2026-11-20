<template>
  <header class="top-bar">
    <!-- Brand (mobile; the desktop sidebar carries it) -->
    <NuxtLink to="/" class="top-bar__brand">
      <span
        aria-hidden="true"
        class="material-symbols-outlined fill top-bar__logo"
        >graphic_eq</span
      >
      <span class="top-bar__name">Sporky</span>
    </NuxtLink>

    <div class="avatar" :title="userProfile?.display_name || undefined">
      <img v-if="avatar" :src="avatar" alt="" class="avatar__image" />
      <div v-else class="avatar__fallback">
        <span aria-hidden="true" class="material-symbols-outlined avatar__icon"
          >person</span
        >
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSporky } from '~/stores/sporky';

const store = useSporky();
const { userProfile } = storeToRefs(store);

const avatar = computed(() => userProfile.value?.images?.[0]?.url ?? null);
</script>

<style scoped lang="scss">
// Spans the content column: full width on mobile, right of the sidebar on
// desktop.
.top-bar {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 30;
  display: flex;
  height: var(--top-bar-height);
  align-items: center;
  justify-content: space-between;
  background-color: alpha(surface, 60%);
  padding-inline: var(--gutter);
  backdrop-filter: blur(64px);

  @include from(md) {
    left: var(--sidebar-width);
    padding-inline: var(--container-padding);
  }
}

.top-bar__brand {
  display: flex;
  min-height: space(11);
  align-items: center;
  gap: space(2);
  color: token(on-surface);

  @include from(md) {
    display: none;
  }
}

.top-bar__logo {
  color: token(primary);
}

.top-bar__name {
  @include type(headline-md);
}

.avatar {
  margin-left: auto;
  width: space(8);
  height: space(8);
  overflow: hidden;
  border: 1px solid token(surface-variant);
  border-radius: var(--radius-full);
}

.avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar__fallback {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background-color: token(surface-variant);
  color: token(on-surface-variant);
}

.avatar__icon {
  @include icon-size(xl);
}
</style>
