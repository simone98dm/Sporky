<template>
  <div
    role="group"
    aria-label="Time range"
    class="flex w-fit items-center rounded-full border border-white/10 bg-surface-container-low p-1"
  >
    <button
      v-for="option in TIME_RANGE_OPTIONS"
      :key="option.value"
      type="button"
      :aria-disabled="disabled || undefined"
      :aria-pressed="modelValue === option.value"
      :aria-label="variant === 'short' ? option.label : undefined"
      :class="[
        'min-h-11 rounded-full px-4 text-body-sm font-semibold transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        variant === 'label' ? 'px-6' : '',
        modelValue === option.value
          ? 'tab-active'
          : 'text-on-surface-variant hover:text-on-surface',
      ]"
      @click="select(option.value)"
    >
      {{ variant === 'short' ? option.short : option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { TIME_RANGE_OPTIONS } from '~/utils/const';

type TimeRange = (typeof TIME_RANGE_OPTIONS)[number]['value'];

interface TimePeriodSelectorProps {
  modelValue: TimeRange;
  variant?: 'short' | 'label';
  disabled?: boolean;
}

const { variant = 'label', disabled = false } =
  defineProps<TimePeriodSelectorProps>();

interface TimePeriodSelectorEvents {
  'update:modelValue': [value: TimeRange];
}

const emit = defineEmits<TimePeriodSelectorEvents>();

// aria-disabled (not disabled) keeps keyboard focus on the button while a
// range loads, so the click is ignored here instead.
const select = (value: TimeRange) => {
  if (!disabled) emit('update:modelValue', value);
};
</script>
