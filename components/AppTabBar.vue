<template>
  <!-- Mobile primary navigation, in thumb reach; desktop uses AppSidebar -->
  <nav aria-label="Main" class="tab-bar">
    <NuxtLink
      v-for="item in NAV_ITEMS"
      :key="item.label"
      :to="item.to"
      :aria-current="isActiveNav(item, route.path) ? 'page' : undefined"
      :class="['tab-bar__item', { 'is-active': isActiveNav(item, route.path) }]"
    >
      <span
        aria-hidden="true"
        class="material-symbols-outlined tab-bar__icon"
        :class="{ fill: isActiveNav(item, route.path) }"
        >{{ item.icon }}</span
      >
      {{ item.label }}
    </NuxtLink>
    <button type="button" class="tab-bar__item" @click="store.logout()">
      <span aria-hidden="true" class="material-symbols-outlined">logout</span>
      Log out
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useSporky } from '~/stores/sporky';
import { NAV_ITEMS } from '~/utils/const';
import { isActiveNav } from '~/utils/common';

const store = useSporky();
const route = useRoute();
</script>

<style scoped lang="scss">
.tab-bar {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top-width: 1px;
  border-color: token(surface-container-high);
  background-color: alpha(surface, 85%);
  padding-bottom: env(safe-area-inset-bottom);
  backdrop-filter: blur(64px);

  @include from(md) {
    display: none;
  }
}

.tab-bar__item {
  display: flex;
  height: var(--tab-bar-height);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: space(1);
  @include type(label-caps);
  color: token(on-surface-variant);
  @include transition-colors;

  &:hover,
  &.is-active {
    color: token(on-surface);
  }
}

.is-active .tab-bar__icon {
  color: token(primary);
}
</style>
