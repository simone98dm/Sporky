<template>
  <header
    class="fixed right-0 top-0 z-30 flex h-16 w-full items-center justify-between bg-surface/60 px-gutter backdrop-blur-3xl md:w-[calc(100%-280px)] md:px-container-padding"
  >
    <!-- Brand (mobile; the desktop sidebar carries it) -->
    <NuxtLink
      to="/"
      class="flex min-h-11 items-center gap-2 text-on-surface md:hidden"
    >
      <span
        aria-hidden="true"
        class="material-symbols-outlined fill text-primary"
        >graphic_eq</span
      >
      <span class="text-headline-md">Sporky</span>
    </NuxtLink>

    <div
      class="ml-auto h-8 w-8 overflow-hidden rounded-full border border-surface-variant"
      :title="userProfile?.display_name || undefined"
    >
      <img
        v-if="avatar"
        :src="avatar"
        alt=""
        class="h-full w-full object-cover"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-surface-variant text-on-surface-variant"
      >
        <span aria-hidden="true" class="material-symbols-outlined text-base"
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
