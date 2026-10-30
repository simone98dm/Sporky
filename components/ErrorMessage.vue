<template>
  <div
    class="rounded-xl border border-error/20 bg-error-container/20 p-6 glass-panel"
  >
    <div class="flex items-start gap-4">
      <div
        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-error/20"
      >
        <span aria-hidden="true" class="material-symbols-outlined text-error"
          >error</span
        >
      </div>

      <div class="flex-1">
        <h2 class="mb-2 text-body-lg font-semibold text-error">
          {{ title || 'Something went wrong' }}
        </h2>
        <p class="mb-4 text-body-sm leading-relaxed text-on-surface-variant">
          {{ message }}
        </p>

        <div class="flex flex-col gap-3 sm:flex-row">
          <button
            v-if="showRetry"
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-error/20 px-4 py-2 font-medium text-error transition-colors hover:bg-error/30"
            @click="emit('retry')"
          >
            <span aria-hidden="true" class="material-symbols-outlined text-base"
              >refresh</span
            >
            Try Again
          </button>

          <button
            v-if="dismissible"
            type="button"
            class="inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium text-on-surface-variant transition-colors hover:text-on-surface"
            @click="emit('dismiss')"
          >
            <span aria-hidden="true" class="material-symbols-outlined text-base"
              >close</span
            >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ErrorMessage - Error display with retry and dismiss actions.
 * @example <ErrorMessage message="Failed to load" :show-retry="true" @retry="handleRetry" />
 */
interface ErrorMessageProps {
  message: string;
  title?: string;
  showRetry?: boolean;
  dismissible?: boolean;
}

const {
  message,
  title,
  showRetry = false,
  dismissible = false,
} = defineProps<ErrorMessageProps>();

interface ErrorMessageEvents {
  retry: [];
  dismiss: [];
}

const emit = defineEmits<ErrorMessageEvents>();
</script>
