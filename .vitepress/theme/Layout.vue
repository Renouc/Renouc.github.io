<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, provide, ref } from 'vue';
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

const { isDark, frontmatter } = useData();

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value;
    return;
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`,
  ];

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value;
    await nextTick();
  }).ready;

  const isDarkAfter = isDark.value;
  const transitionClipPath = isDarkAfter ? [...clipPath].reverse() : clipPath;

  document.documentElement.animate(
    { clipPath: transitionClipPath },
    {
      duration: 300,
      easing: 'ease-in',
      fill: 'both',
      pseudoElement: `::view-transition-${isDarkAfter ? 'old' : 'new'}(root)`,
    }
  );
});

const progress = ref(0);
const isDoc = computed(() => frontmatter.value.layout !== 'home');

function updateProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.value = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
}

onMounted(() => window.addEventListener('scroll', updateProgress, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', updateProgress));
</script>

<template>
  <div v-show="isDoc" class="reading-progress" :style="{ width: progress + '%' }" />
  <DefaultTheme.Layout />
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}

.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  height: 2px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-next));
  transition: width 0.08s linear;
  pointer-events: none;
}
</style>
