<script setup>
/**
 * NavBar — Barra de navegación superior.
 * Muestra el logo de la app y el botón "Cerrar Sesión"
 * (visible solo cuando el usuario está autenticado).
 * Logout limpia tanto auth como weather stores.
 */
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useWeatherStore } from '@/stores/weather.store.js'

const router = useRouter()
const authStore = useAuthStore()
const weatherStore = useWeatherStore()

function handleLogout() {
  weatherStore.clearAll()
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="Navegación principal">
    <div class="navbar__brand">
      <span class="navbar__icon" aria-hidden="true">🌤️</span>
      <span class="navbar__title">ClimaApp</span>
    </div>

    <button
      v-if="authStore.isAuthenticated"
      class="navbar__logout"
      @click="handleLogout"
      aria-label="Cerrar sesión"
    >
      Cerrar Sesión
    </button>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg) var(--space-xl);
  background: var(--color-card);
  border-bottom: 1px solid var(--color-surface);
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.navbar__icon {
  font-size: 1.5rem;
}

.navbar__title {
  font-size: var(--font-size-h2);
  font-weight: 700;
  color: var(--color-text);
}

.navbar__logout {
  color: var(--color-text);
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  font-weight: 500;
  min-height: 44px;
  transition: background-color var(--transition-fast),
              border-color var(--transition-fast);
}

.navbar__logout:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-muted);
}
</style>
