<template>
  <div class="error-card glass-panel">
    <div class="error-card__body">
      <div class="error-card__badge">
        <span aria-hidden="true" class="material-symbols-outlined">error</span>
      </div>

      <div class="error-card__content">
        <h2 class="error-card__title">
          {{ title || 'Something went wrong' }}
        </h2>
        <p class="error-card__message">
          {{ message }}
        </p>

        <div class="error-card__actions">
          <button
            v-if="showRetry"
            type="button"
            class="error-card__action"
            @click="emit('retry')"
          >
            <span
              aria-hidden="true"
              class="material-symbols-outlined error-card__action-icon"
              >refresh</span
            >
            {{ retryLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ErrorMessage - Error display with an optional retry action.
 * @example <ErrorMessage message="Failed to load" :show-retry="true" @retry="handleRetry" />
 */
interface ErrorMessageProps {
  message: string;
  title?: string;
  showRetry?: boolean;
  retryLabel?: string;
}

const {
  message,
  title,
  showRetry = false,
  retryLabel = 'Try Again',
} = defineProps<ErrorMessageProps>();

interface ErrorMessageEvents {
  retry: [];
}

const emit = defineEmits<ErrorMessageEvents>();
</script>

<style scoped lang="scss">
// Glass surface (global .glass-panel) with an error-coloured badge.
.error-card {
  border-radius: var(--radius-xl);
  padding: space(6);
}

.error-card__body {
  display: flex;
  align-items: flex-start;
  gap: space(4);
}

.error-card__badge {
  display: flex;
  width: space(10);
  height: space(10);
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background-color: alpha(error, 20%);

  .material-symbols-outlined {
    color: token(error);
  }
}

.error-card__content {
  flex: 1 1 0%;
}

.error-card__title {
  margin-bottom: space(2);
  @include type(body-lg);
  font-weight: 600;
  color: token(error);
}

.error-card__message {
  margin-bottom: space(4);
  @include type(body-sm);
  line-height: 1.625;
  color: token(on-surface-variant);
}

.error-card__actions {
  display: flex;
  flex-direction: column;
  gap: space(3);

  @include from(sm) {
    flex-direction: row;
  }
}

.error-card__action {
  display: inline-flex;
  align-items: center;
  gap: space(2);
  border-radius: var(--radius-full);
  background-color: alpha(error, 20%);
  padding: space(2) space(4);
  font-weight: 500;
  color: token(error);
  @include transition-colors;

  &:hover {
    background-color: alpha(error, 30%);
  }
}

.error-card__action-icon {
  @include icon-size(xl);
}
</style>
