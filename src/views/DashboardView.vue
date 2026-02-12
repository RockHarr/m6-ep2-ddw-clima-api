<script setup>
/**
 * DashboardView — Pantalla principal del dashboard.
 *
 * Compone: CitySearch + CityResults + WeatherCards + Favoritos
 *
 * handleCitySelect: Método orquestador que centraliza el flujo
 * seleccionar ciudad → limpiar input → cerrar dropdown → fetch.
 * Inspirado en el patrón organizeAllDetails (Smashing Magazine).
 */
import { ref, onMounted } from 'vue'
import { useWeatherStore } from '@/stores/weather.store.js'
import CitySearch from '@/components/CitySearch.vue'
import CityResults from '@/components/CityResults.vue'
import WeatherCards from '@/components/WeatherCards.vue'

const weatherStore = useWeatherStore()
const citySearchRef = ref(null)

/**
 * Orquestador: centraliza el flujo de selección de ciudad.
 * 1. Selecciona la ciudad (dispara fetch del clima)
 * 2. Limpia el input de búsqueda
 */
async function handleCitySelect(city) {
  await weatherStore.selectCity(city)
  citySearchRef.value?.clearInput()
}

/**
 * Al montar: carga favoritos y última ciudad.
 * Si hay última ciudad, auto-carga el clima (Bonus 1).
 */
onMounted(async () => {
  weatherStore.loadFavorites()
  await weatherStore.loadLastCity()
})
</script>

<template>
  <main class="dashboard">
    <!-- Búsqueda -->
    <section class="dashboard__search" aria-label="Buscar ciudad">
      <CitySearch ref="citySearchRef" />
      <CityResults @select="handleCitySelect" />
    </section>

    <!-- Favoritos (Bonus 2) -->
    <section
      v-if="weatherStore.favorites.length > 0"
      class="dashboard__favorites"
      aria-label="Ciudades favoritas"
    >
      <h3 class="dashboard__favorites-title">⭐ Favoritos</h3>
      <TransitionGroup name="list" tag="div" class="dashboard__chips">
        <button
          v-for="fav in weatherStore.favorites"
          :key="fav.id"
          class="dashboard__chip"
          @click="handleCitySelect(fav)"
          :aria-label="`Cargar clima de ${fav.name}`"
        >
          {{ fav.name }}<template v-if="fav.country">, {{ fav.country }}</template>
          <span
            class="dashboard__chip-remove"
            @click.stop="weatherStore.removeFavorite(fav.id)"
            aria-label="Quitar de favoritos"
            role="button"
            tabindex="0"
            @keyup.enter.stop="weatherStore.removeFavorite(fav.id)"
          >✕</span>
        </button>
      </TransitionGroup>
    </section>

    <!-- Clima -->
    <section class="dashboard__weather">
      <!-- Empty state: sin ciudad seleccionada -->
      <div
        v-if="!weatherStore.selectedCity && weatherStore.statusWeather === 'idle'"
        class="dashboard__empty"
      >
        <span class="dashboard__empty-icon" aria-hidden="true">☁️</span>
        <p class="dashboard__empty-text">Busca una ciudad para ver el pronóstico</p>
      </div>

      <!-- Cards del clima -->
      <WeatherCards v-else />
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

.dashboard__favorites-title {
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}

.dashboard__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.dashboard__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-secondary);
  color: white;
  font-weight: 500;
  font-size: var(--font-size-small);
  border-radius: var(--radius-full);
  min-height: 36px;
  transition: background-color var(--transition-fast),
              transform var(--transition-fast);
}

.dashboard__chip:hover {
  background: var(--color-secondary-hover);
  transform: translateY(-1px);
}

.dashboard__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.dashboard__chip-remove:hover {
  background: rgba(255, 255, 255, 0.4);
}

.dashboard__empty {
  text-align: center;
  padding: var(--space-3xl);
}

.dashboard__empty-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: var(--space-xl);
  opacity: 0.3;
}

.dashboard__empty-text {
  font-size: var(--font-size-h3);
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .dashboard {
    padding: var(--space-lg) var(--space-lg);
  }
}
</style>
