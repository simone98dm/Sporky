<template>
  <div
    class="relative flex min-h-screen w-full flex-col overflow-hidden bg-background"
  >
    <!-- Sonic-depth ambient background -->
    <div class="absolute inset-0 z-0">
      <div
        class="ambient-login h-full w-full opacity-80 mix-blend-screen"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50"
      ></div>
    </div>

    <div
      class="relative z-10 flex flex-1 items-center justify-center px-container-padding py-section-margin"
    >
      <div class="flex w-full max-w-[480px] flex-col">
        <!-- Login card -->
        <div
          class="flex flex-col items-center rounded-xl border border-surface-bright/20 bg-surface-container-high/80 p-card-gap shadow-2xl backdrop-blur-xl"
        >
          <div
            class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20"
          >
            <span
              aria-hidden="true"
              class="material-symbols-outlined fill text-4xl text-primary"
              >graphic_eq</span
            >
          </div>

          <h1
            class="pb-4 pt-2 text-center text-display-lg-mobile text-on-surface md:text-display-lg"
          >
            Visualize your rhythm.
          </h1>
          <p
            class="max-w-[320px] px-4 pb-8 text-center text-body-lg text-on-surface-variant"
          >
            Discover your top tracks across time, analyze your listening habits,
            and see your musical journey unfold.
          </p>

          <!-- Auth error -->
          <div v-if="errorMessage" class="w-full pb-6">
            <div
              class="flex items-center gap-3 rounded-lg border border-error/20 bg-error-container/20 p-4"
            >
              <span
                aria-hidden="true"
                class="material-symbols-outlined text-error"
                >error</span
              >
              <p class="text-body-sm text-on-surface-variant">
                {{ errorMessage }}
              </p>
            </div>
          </div>

          <div class="flex w-full justify-center pb-4">
            <button
              type="button"
              class="flex h-14 w-full max-w-[400px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full bg-primary-container px-6 font-bold tracking-wide text-on-primary-container shadow-lg shadow-primary-container/20 transition-colors duration-300 hover:bg-primary-fixed-dim hover:text-on-primary"
              @click="handleLogin"
            >
              <svg
                class="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"
                />
              </svg>
              <span class="truncate text-lg">Connect with Spotify</span>
            </button>
          </div>

          <p
            class="max-w-[280px] pt-6 text-center text-body-sm text-on-surface-variant/60"
          >
            By connecting, Sporky reads your Spotify profile and top tracks.
            Nothing is stored outside your browser.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSporky } from '~/stores/sporky';

definePageMeta({ layout: false });

const store = useSporky();
const route = useRoute();

const handleLogin = async () => {
  try {
    await store.login();
  } catch (error) {
    console.error('Login failed:', error);
  }
};

const errorParam = computed(() => route.query.error as string | undefined);
const errorMessage = computed(() => {
  switch (errorParam.value) {
    case undefined:
      return null;
    case 'access_denied':
      return 'Access was denied. Please try again.';
    case 'no_code':
      return 'Authorization failed. Please try again.';
    case 'state_mismatch':
      return 'Login session expired or was tampered with. Please try again.';
    case 'auth_failed':
      return 'Authentication failed. Please check your credentials.';
    default:
      return 'An error occurred during login. Please try again.';
  }
});
</script>

<style scoped>
.ambient-login {
  background:
    radial-gradient(
      circle at 30% 30%,
      rgba(113, 30, 186, 0.25) 0%,
      transparent 55%
    ),
    radial-gradient(
      circle at 70% 60%,
      rgba(221, 184, 255, 0.12) 0%,
      transparent 50%
    );
}
</style>
