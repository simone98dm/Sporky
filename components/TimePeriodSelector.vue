<template>
  <div role="group" aria-label="Time range" class="range-selector">
    <button
      v-for="option in TIME_RANGE_OPTIONS"
      :key="option.value"
      type="button"
      :aria-disabled="disabled || undefined"
      :aria-pressed="modelValue === option.value"
      :aria-label="option.label"
      :class="[
        'range-selector__option',
        { 'is-active': modelValue === option.value },
      ]"
      @click="select(option.value)"
    >
      {{ option.short }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { TIME_RANGE_OPTIONS } from '~/utils/const';

type TimeRange = (typeof TIME_RANGE_OPTIONS)[number]['value'];

interface TimePeriodSelectorProps {
  modelValue: TimeRange;
  disabled?: boolean;
}

const { disabled = false } = defineProps<TimePeriodSelectorProps>();

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

<style scoped lang="scss">
// Pill-shaped switcher (DESIGN.md › Components › Tabs).
.range-selector {
  display: flex;
  width: fit-content;
  align-items: center;
  border: 1px solid token(hairline);
  border-radius: var(--radius-full);
  background-color: token(surface-container-low);
  padding: space(1);
}

.range-selector__option {
  min-height: space(11);
  border-radius: var(--radius-full);
  padding-inline: space(4);
  @include type(body-sm);
  font-weight: 600;
  color: token(on-surface-variant);
  @include transition-colors;

  &:hover {
    color: token(on-surface);
  }

  &.is-active {
    background-color: token(surface-container-high);
    color: token(on-surface);
  }

  // aria-disabled keeps focus on the button while a range loads.
  &[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
