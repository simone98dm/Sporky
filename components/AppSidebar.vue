<template>
  <!-- Desktop sidebar; mobile uses AppTabBar -->
  <aside class="sidebar">
    <!-- Brand -->
    <NuxtLink to="/" class="sidebar__brand">
      <span class="sidebar__logo">
        <span aria-hidden="true" class="material-symbols-outlined fill"
          >graphic_eq</span
        >
      </span>
      <span class="sidebar__name">Sporky</span>
    </NuxtLink>

    <!-- Navigation -->
    <nav aria-label="Main" class="sidebar__nav">
      <NuxtLink
        v-for="item in NAV_ITEMS"
        :key="item.label"
        :to="item.to"
        :aria-current="isActiveNav(item, route.path) ? 'page' : undefined"
        :class="[
          'sidebar__link',
          { 'is-active': isActiveNav(item, route.path) },
        ]"
      >
        <span
          aria-hidden="true"
          class="material-symbols-outlined sidebar__icon"
          :class="{ fill: isActiveNav(item, route.path) }"
          >{{ item.icon }}</span
        >
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Footer -->
    <div class="sidebar__footer">
      <button
        type="button"
        class="sidebar__link sidebar__link--button"
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

<style scoped lang="scss">
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
  display: none;
  width: var(--sidebar-width);
  height: 100%;
  flex-direction: column;
  row-gap: space(6);
  border-right-width: 1px;
  border-color: token(surface-container-low);
  background-color: token(surface);
  padding: space(8) space(6);

  @include from(md) {
    display: flex;
  }
}

.sidebar__brand {
  margin-bottom: space(4);
  display: flex;
  align-items: center;
  gap: space(3);
  border-radius: var(--radius-lg);
}

.sidebar__logo {
  display: flex;
  width: space(12);
  height: space(12);
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: alpha(primary-container, 20%);

  .material-symbols-outlined {
    color: token(primary);
  }
}

.sidebar__name {
  @include type(display-lg-mobile);
  line-height: 1;
  color: token(on-surface);
}

.sidebar__nav {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  gap: space(1);
}

.sidebar__link {
  display: flex;
  min-height: space(11);
  align-items: center;
  gap: space(4);
  border-radius: var(--radius-lg);
  padding: space(3) space(4);
  font-weight: 500;
  color: token(on-surface-variant);
  @include transition-colors(200ms);

  &:hover {
    background-color: token(surface-container);
    color: token(on-surface);
  }

  &.is-active {
    background-color: token(surface-container-high);
    font-weight: 700;
    color: token(on-surface);
  }

  &--button {
    width: 100%;
    padding-block: space(2);
    @include transition-colors;
  }
}

.is-active .sidebar__icon {
  color: token(primary);
}

.sidebar__footer {
  margin-top: auto;
  border-top-width: 1px;
  border-color: token(surface-container-low);
  padding-top: space(6);
}
</style>
