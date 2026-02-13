<script setup>
/**
 * ShinyText — Texto con efecto de brillo deslizante.
 * Portado de vue-bits (DavidHDev/vue-bits) a JavaScript puro.
 */
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  speed: { type: Number, default: 5 },
  className: { type: String, default: '' },
})

const animationDuration = computed(() => `${props.speed}s`)
</script>

<template>
  <span
    class="shiny-text"
    :class="[{ 'shiny-text--animate': !disabled }, className]"
    :style="{ animationDuration }"
  >
    {{ text }}
  </span>
</template>

<style scoped>
.shiny-text {
  display: inline-block;
  background-image: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 255, 255, 0.85) 50%,
    rgba(255, 255, 255, 0) 60%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: var(--color-text);
}

.shiny-text--animate {
  animation: shine linear infinite;
}

@keyframes shine {
  0% { background-position: 100%; }
  100% { background-position: -100%; }
}
</style>
