<script setup>
/**
 * CityResults — Lista de resultados de búsqueda de ciudades.
 * Muestra un dropdown con las ciudades encontradas.
 * Cada ítem es clickeable y dispara la selección.
 */
import { useWeatherStore } from '@/stores/weather.store.js'
import UiAlert from './UiAlert.vue'
import LoadingSkeleton from './LoadingSkeleton.vue'

const weatherStore = useWeatherStore()

defineEmits(['select'])
</script>

<template>
  <div class="city-results" v-if="weatherStore.statusCities !== 'idle'">
    <!-- Loading -->
    <LoadingSkeleton v-if="weatherStore.statusCities === 'loading'" type="list" />

    <!-- Error -->
    <UiAlert
      v-else-if="weatherStore.statusCities === 'error'"
      :message="weatherStore.errorCities"
      type="error"
      :retryable="true"
      @retry="weatherStore.searchCitiesAction"
    />

    <!-- Empty -->
    <div v-else-if="weatherStore.statusCities === 'empty'" class="city-results__empty">
      <p>No se encontraron ciudades. Intenta con otro nombre.</p>
    </div>

    <!-- Results list -->
    <TransitionGroup
      v-else-if="weatherStore.statusCities === 'success'"
      name="list"
      tag="ul"
      class="city-results__list"
      role="listbox"
      aria-label="Resultados de búsqueda de ciudades"
    >
      <li
        v-for="city in weatherStore.cities"
        :key="city.id"
        class="city-results__item"
        role="option"
        tabindex="0"
        @click="$emit('select', city)"
        @keyup.enter="$emit('select', city)"
      >
        <span class="city-results__name">{{ city.name }}</span>
        <span class="city-results__detail">{{ city.admin ? `${city.admin}, ` : '' }}{{ city.country }}</span>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.city-results {
  margin-top: var(--space-sm);
}

.city-results__list {
  list-style: none;
  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-surface);
  overflow: hidden;
}

.city-results__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  min-height: 44px;
  transition: background-color var(--transition-fast);
}

.city-results__item:hover,
.city-results__item:focus {
  background: var(--color-surface);
}

.city-results__item + .city-results__item {
  border-top: 1px solid var(--color-surface);
}

.city-results__name {
  font-weight: 500;
  color: var(--color-text);
}

.city-results__detail {
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
}

.city-results__empty {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-muted);
}
</style>
