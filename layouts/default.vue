<template>
  <div class="ambient-glow relative flex min-h-screen bg-background">
    <AppSidebar />
    <AppTopNav />
    <main
      class="relative z-10 min-w-0 flex-1 px-gutter pb-28 pt-20 md:ml-[280px] md:px-container-padding md:pb-16 md:pt-24"
    >
      <slot />
    </main>
    <AppTabBar />
  </div>
</template>
