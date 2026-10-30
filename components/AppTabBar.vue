<template>
  <!-- Mobile primary navigation, in thumb reach; desktop uses AppSidebar -->
  <nav
    aria-label="Main"
    class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-surface-container-high bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-3xl md:hidden"
  >
    <NuxtLink
      v-for="item in NAV_ITEMS"
      :key="item.label"
      :to="item.to"
      :aria-current="isActiveNav(item, route.path) ? 'page' : undefined"
      :class="[
        'flex h-16 flex-col items-center justify-center gap-1 text-label-caps transition-colors',
        isActiveNav(item, route.path)
          ? 'text-on-surface'
          : 'text-on-surface-variant hover:text-on-surface',
      ]"
    >
      <span
        aria-hidden="true"
        class="material-symbols-outlined"
        :class="isActiveNav(item, route.path) ? 'fill text-primary' : ''"
        >{{ item.icon }}</span
      >
      {{ item.label }}
    </NuxtLink>
    <button
      type="button"
      class="flex h-16 flex-col items-center justify-center gap-1 text-label-caps text-on-surface-variant transition-colors hover:text-on-surface"
      @click="store.logout()"
    >
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
