<script setup>
/**
 * CityResults — Lista de resultados de búsqueda de ciudades.
 * Muestra un dropdown con las ciudades encontradas o tarjetas ricas para ciudades por defecto.
 */
import { computed } from 'vue'
import { useWeatherStore } from '@/stores/weather.store.js'
import UiAlert from './UiAlert.vue'
import LoadingSkeleton from './LoadingSkeleton.vue'
import SidebarCityCard from './SidebarCityCard.vue'

const weatherStore = useWeatherStore()
const props = defineProps({
  query: { type: String, default: '' },
  mobileHidden: { type: Boolean, default: false },
})
defineEmits(['select'])

const isSearching = computed(() => props.query && props.query.trim().length > 0)
</script>

<template>
  <div class="city-results" v-if="weatherStore.statusCities !== 'idle'" :class="{ 'city-results--mobile-hidden': mobileHidden }">
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
    <template v-else-if="weatherStore.statusCities === 'success'">
      <div v-if="!isSearching" class="city-results__discovery-header">
        <h3 class="city-results__discovery-title">🌍 Descubre el mundo</h3>
        <p class="city-results__discovery-subtitle">Ciudades populares en tiempo real</p>
      </div>

      <TransitionGroup
        name="list"
        tag="ul"
        class="city-results__list"
        :class="{ 'city-results__list--cards': !isSearching }"
        role="listbox"
      >
        <li
          v-for="city in weatherStore.cities"
          :key="city.id"
          class="city-results__item-wrapper"
        >
          <SidebarCityCard 
            v-if="!isSearching"
            :city="city"
            :weather="weatherStore.defaultCitiesWeather[city.id]"
            @select="$emit('select', $event)"
          />
          <div
            v-else
            class="city-results__item"
            role="option"
            tabindex="0"
            @click="$emit('select', city)"
          >
            <span class="city-results__name">{{ city.name }}</span>
            <span class="city-results__detail">{{ city.admin ? `${city.admin}, ` : '' }}{{ city.country }}</span>
          </div>
        </li>
      </TransitionGroup>
    </template>
  </div>
</template>

<style scoped>
.city-results {
  margin-top: var(--space-sm);
  max-width: 100%;
}

.city-results__discovery-header {
  margin-bottom: var(--space-lg);
  padding: 0 var(--space-xs);
}

.city-results__discovery-title {
  font-size: 0.9rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  margin-bottom: 2px;
}

.city-results__discovery-subtitle {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  opacity: 0.8;
}

.city-results__list {
  list-style: none;
  border-radius: var(--radius-md);
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.city-results__list--cards {
  display: flex;
  flex-direction: column;
  background: transparent;
  gap: var(--space-md);
}

.city-results__item-wrapper {
  list-style: none;
}

.city-results__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  min-height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--transition-fast);
}

.city-results__item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
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

@media (max-width: 768px) {
  .city-results--mobile-hidden {
    display: none;
  }
}
</style>
