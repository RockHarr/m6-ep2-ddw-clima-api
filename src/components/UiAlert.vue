<script setup>
/**
 * UiAlert — Componente reutilizable de alertas.
 * Soporta tipos: error, info, success, warning.
 * Usa role="alert" para que los lectores de pantalla
 * anuncien el mensaje automáticamente (WCAG AA).
 */
defineProps({
  message: { type: String, required: true },
  type: { type: String, default: 'error', validator: v => ['error', 'info', 'success', 'warning'].includes(v) },
  retryable: { type: Boolean, default: false }
})

defineEmits(['retry'])
</script>

<template>
  <div
    class="ui-alert"
    :class="`ui-alert--${type}`"
    role="alert"
    aria-live="assertive"
  >
    <span class="ui-alert__icon" aria-hidden="true">
      {{ type === 'error' ? '⚠️' : type === 'success' ? '✅' : type === 'warning' ? '⚡' : 'ℹ️' }}
    </span>
    <p class="ui-alert__message">{{ message }}</p>
    <button
      v-if="retryable"
      class="ui-alert__retry"
      @click="$emit('retry')"
    >
      Reintentar
    </button>
  </div>
</template>

<style scoped>
.ui-alert {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  border-left: 4px solid;
  background: var(--color-card);
}

.ui-alert--error {
  border-left-color: var(--color-error);
}

.ui-alert--success {
  border-left-color: var(--color-success);
}

.ui-alert--warning {
  border-left-color: var(--color-warning);
}

.ui-alert--info {
  border-left-color: var(--color-primary);
}

.ui-alert__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.ui-alert__message {
  flex: 1;
  color: var(--color-text);
  font-size: var(--font-size-body);
}

.ui-alert__retry {
  color: var(--color-text);
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--color-text-muted);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  min-height: 44px;
  transition: background-color var(--transition-fast);
}

.ui-alert__retry:hover {
  background-color: var(--color-surface);
}
</style>
