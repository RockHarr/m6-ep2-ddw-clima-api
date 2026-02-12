<script setup>
/**
 * LoadingSkeleton — Esqueleto animado de carga.
 * Muestra formas pulsantes que imitan el contenido que se cargará.
 * La animación se desactiva automáticamente si el usuario
 * tiene prefers-reduced-motion activado (via main.css).
 */
defineProps({
  type: {
    type: String,
    default: 'card',
    validator: v => ['card', 'list'].includes(v)
  }
})
</script>

<template>
  <div class="skeleton" :class="`skeleton--${type}`" aria-hidden="true">
    <template v-if="type === 'card'">
      <div class="skeleton__cards">
        <div class="skeleton__card" v-for="n in 2" :key="n">
          <div class="skeleton__line skeleton__line--title"></div>
          <div class="skeleton__circle"></div>
          <div class="skeleton__line skeleton__line--text"></div>
          <div class="skeleton__line skeleton__line--small"></div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="skeleton__list-item" v-for="n in 3" :key="n">
        <div class="skeleton__line skeleton__line--full"></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.skeleton__cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xl);
}

.skeleton__card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
}

.skeleton__line {
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton__line--title {
  width: 60%;
  height: 20px;
}

.skeleton__line--text {
  width: 80%;
  height: 16px;
}

.skeleton__line--small {
  width: 50%;
  height: 14px;
}

.skeleton__line--full {
  width: 100%;
  height: 44px;
}

.skeleton__circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-surface);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton__list-item {
  padding: var(--space-sm) 0;
}

.skeleton__list-item + .skeleton__list-item {
  margin-top: var(--space-sm);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (max-width: 640px) {
  .skeleton__cards {
    grid-template-columns: 1fr;
  }
}
</style>
