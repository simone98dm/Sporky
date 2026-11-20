<template>
  <div class="layout ambient-glow">
    <a href="#main" class="skip-link">Skip to content</a>
    <AppSidebar />
    <AppTopNav />
    <main ref="main" id="main" tabindex="-1" class="layout__main">
      <slot />
    </main>
    <AppTabBar />
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

// Move focus to <main> after client-side navigations (not the first load),
// so keyboard and screen reader users land on the new content.
const mainRef = useTemplateRef<HTMLElement>('main');
const stop = router.afterEach((to, from) => {
  if (to.path !== from.path) {
    nextTick(() => mainRef.value?.focus({ preventScroll: true }));
  }
});
onBeforeUnmount(stop);
</script>

<style scoped lang="scss">
.layout {
  position: relative;
  display: flex;
  min-height: 100vh;
  background-color: token(background);
}

// Hidden until focused, then pinned top-left above the navigation.
.skip-link {
  @include sr-only;
  z-index: 50;
  border-radius: var(--radius-full);
  background-color: token(surface-container-high);
  padding: space(3) space(5);
  font-weight: 600;
  color: token(on-surface);

  &:focus {
    @include not-sr-only;
    position: fixed;
    top: space(4);
    left: space(4);
    padding: space(3) space(5);
  }
}

// Clears the fixed top bar and, on mobile, the bottom tab bar.
.layout__main {
  position: relative;
  z-index: 10;
  min-width: 0;
  flex: 1 1 0%;
  padding: calc(var(--top-bar-height) + #{space(4)}) var(--gutter)
    calc(var(--tab-bar-height) + #{space(12)});

  // A programmatic focus target, not a control: no ring.
  &:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  @include from(md) {
    margin-left: var(--sidebar-width);
    padding: calc(var(--top-bar-height) + #{space(8)}) var(--container-padding)
      space(16);
  }
}
</style>
