<script lang="ts" setup>
/**
 * TYPES
 */
type Props = {
  forceDark?: boolean;
  fillColor?: string;
  hoverFillColor?: string;
  text?: boolean;
  size?: string;
  color?: string;
  hoverColor?: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  forceDark: false,
  fillColor: '',
  hoverFillColor: '',
  color: '',
  hoverColor: '',
  text: false,
  size: 'small',
});

/**
 * COMPOSABLES
 */
// const { darkMode } = useDarkMode();
// const tailwind = useTailwind();

/**
 * COMPUTED
 */
const logoText = computed(() => {
  if (props.text) return 'regenerative<br>finance';
  return 'regenerative';
});
</script>

<template>
  <div class="flex items-center sm:mr-4 font-bold capitalize app-logo">
    <svg
      id="logo"
      class="mr-2 logo-svg"
      :width="props.size == 'large' ? 44 : 22"
      :height="props.size == 'large' ? 40 : 20"
      viewBox="0 0 22 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="logoTitle logoDesc"
      role="img"
    >
      <title id="logoTitle">Balancer logo homepage link</title>
      <desc id="logoDesc">Balancer Logotype homepage link</desc>
      <path
        class="svg-path"
        d="M6.09193 1.78711C6.76483 1.78711 7.31032 2.33188 7.31032
      3.0039V13.955C7.31032 14.6271 7.85581 15.1718 8.52871 15.1718C9.2016
      15.1718 9.74709 14.6271 9.74709 13.955V5.43748C9.74709 4.76547 10.2926
      4.22069 10.9655 4.22069C11.6384 4.22069 12.1839 4.76547 12.1839
      5.43748V12.7382C12.1839 13.4103 12.7294 13.955 13.4023 13.955C14.0751
      13.955 14.6206 13.4103 14.6206 12.7382V1.78711C14.6206 1.11509 15.1661
      0.570312 15.839 0.570312C16.5119 0.570312 17.0574 1.11509 17.0574
      1.78711V11.5215C17.0574 12.1935 17.6029 12.7382 18.2758 12.7382C18.9487
      12.7382 19.4942 12.1935 19.4942 11.5215V9.08786C19.4942 8.41585 20.0397
      7.87107 20.7126 7.87107C21.3341 7.87107 21.8469 8.33578 21.9216
      8.93625C21.6818 14.7726 16.8683 19.4306 10.9655 19.4306C4.90941 19.4306 0
      14.5276 0 8.47947C0 8.17382 0.0125377 7.8711 0.0371275 7.57179C0.17066
      7.04449 0.648895 6.65428 1.21839 6.65428C1.89128 6.65428 2.43677 7.19905
      2.43677 7.87107V11.5215C2.43677 12.1935 2.98226 12.7382 3.65516
      12.7382C4.32806 12.7382 4.87355 12.1935 4.87355 11.5215V3.0039C4.87355
      2.33188 5.41904 1.78711 6.09193 1.78711Z"
      />
      <defs>
        <linearGradient
          id="paint0_linear_564_1779"
          x1="10.9655"
          y1="-6.9738"
          x2="10.9655"
          y2="14.7155"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#05DBF3" />
          <stop offset="1" stop-color="#0468BE" />
        </linearGradient>
        <linearGradient
          id="paint0_linear_407_28737"
          xmlns="http://www.w3.org/2000/svg"
          x1="13.9827"
          y1="-27.4343"
          x2="-8.17363"
          y2="-22.3144"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#05DBF3" />
          <stop offset="1" stop-color="#0468BE" />
        </linearGradient>
      </defs>
    </svg>
    <div class="logoText" v-html="logoText"></div>
  </div>
</template>

<style scoped>
.logoText {
  color: v-bind('color');
}

.app-logo :deep(.logotype) {
  @apply origin-top-left relative;

  transform: scale(1.1);
}

.svg-path {
  transition: fill 0.2s ease-out;
}

.logo-svg .svg-path {
  fill: v-bind('fillColor');
}

.app-logo:hover .logo-svg .svg-path {
  fill: v-bind('hoverFillColor');
}

.app-logo:hover .logoText {
  color: v-bind('hoverColor');
}

.dark .logo-svg:hover .svg-path {
  fill: theme('colors.yellow.500');
}
</style>