<template>
  <!-- Desktop sidebar; mobile uses AppTabBar -->
  <aside
    class="fixed left-0 top-0 z-40 hidden h-full w-[280px] flex-col gap-y-6 border-r border-surface-container-low bg-surface px-6 py-8 md:flex"
  >
    <!-- Brand -->
    <NuxtLink to="/" class="mb-4 flex items-center gap-3 rounded-lg">
      <span
        class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/20"
      >
        <span
          aria-hidden="true"
          class="material-symbols-outlined fill text-primary"
          >graphic_eq</span
        >
      </span>
      <span class="text-display-lg-mobile leading-none text-on-surface"
        >Sporky</span
      >
    </NuxtLink>

    <!-- Navigation -->
    <nav aria-label="Main" class="flex flex-grow flex-col gap-1">
      <NuxtLink
        v-for="item in NAV_ITEMS"
        :key="item.label"
        :to="item.to"
        :aria-current="isActiveNav(item, route.path) ? 'page' : undefined"
        :class="[
          'flex min-h-11 items-center gap-4 rounded-lg px-4 py-3 transition-colors duration-200',
          isActiveNav(item, route.path)
            ? 'bg-surface-container-high font-bold text-on-surface'
            : 'font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
        ]"
      >
        <span
          aria-hidden="true"
          class="material-symbols-outlined"
          :class="isActiveNav(item, route.path) ? 'fill text-primary' : ''"
          >{{ item.icon }}</span
        >
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Footer -->
    <div class="mt-auto border-t border-surface-container-low pt-6">
      <button
        type="button"
        class="flex min-h-11 w-full items-center gap-4 rounded-lg px-4 py-2 font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        @click="store.logout()"
      >
        <span aria-hidden="true" class="material-symbols-outlined">logout</span>
        <span>Log out</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useSporky } from '~/stores/sporky';
import { NAV_ITEMS } from '~/utils/const';
import { isActiveNav } from '~/utils/common';

const store = useSporky();
const route = useRoute();
</script>
