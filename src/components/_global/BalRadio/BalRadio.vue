<template>
  <div class="inline-flex items-start">
    <input
      type="radio"
      autofocus
      :value="value"
      :checked="modelValue === value || checked"
      :name="name"
      :class="['bal-radio-input', inputClasses]"
      :disabled="disabled"
      @click="onChange(value)"
    />
    <label
      v-if="$slots.label || label"
      :for="name"
      :class="['bal-radio-label', labelClasses]"
      @click.prevent="onChange(value)"
    >
      <slot name="label">
        {{ label }}
      </slot>
    </label>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: 'BalRadio',

  props: {
    checked: { type: Boolean, default: false },
    name: { type: String, required: true },
    value: { type: [String, Number], required: true },
    modelValue: { type: [String, Number], default: '' },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => ['sm', 'md', 'lg'].includes(val),
    },
    color: {
      type: String,
      default: 'blue',
      validator: (val: string): boolean => ['blue'].includes(val),
    },
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    function onChange(value) {
      if (!props.disabled) emit('update:modelValue', value);
    }

    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'w-3 h-3';
        case 'lg':
          return 'w-6 h-6';
        default:
          return 'w-4 h-4';
      }
    });

    const textSizeClass = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'leading-none text-sm';
        case 'lg':
          return 'leading-none text-lg';
        default:
          return 'leading-none text-base';
      }
    });

    const colorClass = computed(() => {
      if (props.disabled) return 'text-gray-500';
      return `text-${props.color}-500`;
    });

    const cursrorClass = computed(() => {
      if (props.disabled) return 'cursor-not-allowed';
      return 'cursor-pointer';
    });

    const inputClasses = computed(() => {
      return {
        [sizeClasses.value]: true,
        [colorClass.value]: true,
        [cursrorClass.value]: true,
      };
    });

    const labelClasses = computed(() => {
      return {
        [textSizeClass.value]: true,
        [cursrorClass.value]: true,
      };
    });

    return {
      onChange,
      inputClasses,
      labelClasses,
    };
  },
});
</script>

<style>
.bal-radio-input {
  @apply bg-white dark:bg-gray-900 rounded-full m-0 shadow-inner transition-all;
  @apply border border-gray-400 dark:border-gray-500;

  transition: all ease 0.25s;
  appearance: none;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  display: inline-block;
  vertical-align: middle;
  background-origin: border-box;
  user-select: none;
}

.bal-radio-input:focus {
  @apply border-2 border-refi-text dark:border-blue-400;
}

.bal-radio-input:checked {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='8' viewBox='0 0 10 8' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8.78905 0.207686C8.70347 0.240631 7.83282 1.2478 6.29239 3.09585L3.92711 5.93341L2.62331 4.63541C1.22416 3.24253 1.13839 3.17924 0.748289 3.25239C0.549318 3.28971 0.31239 3.47347 0.211318 3.66883C0.121694 3.84216 0.120827 4.16145 0.209585 4.3292C0.247397 4.40062 0.956351 5.13352 1.78509 5.95784C3.21036 7.37549 3.30605 7.46076 3.55322 7.5329C3.69692 7.57484 3.87207 7.60918 3.94245 7.60918C4.13608 7.60918 4.49299 7.48972 4.66493 7.36732C4.80954 7.26435 9.49868 1.68137 9.74378 1.32028C9.96594 0.992957 9.86655 0.546168 9.5133 0.284636C9.36369 0.173876 8.9822 0.133334 8.78905 0.207686Z' fill='%230468BE'/%3E%3C/svg%3E");
  border-color: theme(colors.refi-text);
  background-size: 40% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.bal-radio-label {
  @apply ml-2 flex-1;
}
</style>
