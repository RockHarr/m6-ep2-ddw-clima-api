<script setup>
/**
 * CitySearch — Campo de búsqueda de ciudades.
 *
 * Funcionalidades:
 * - Input con label accesible
 * - @keyup.enter para buscar con Enter
 * - Debounce de 300ms al escribir
 * - Validación: no busca si el campo está vacío
 * - Se limpia después de seleccionar una ciudad
 */
import { ref, watch } from 'vue'
import { useWeatherStore } from '@/stores/weather.store.js'

const weatherStore = useWeatherStore()
const query = ref('')
let debounceTimer = null

const emit = defineEmits(['search'])

/**
 * Ejecuta la búsqueda validando que no esté vacío.
 */
function handleSearch() {
  const trimmed = query.value.trim()
  if (!trimmed) return
  weatherStore.searchCitiesAction(trimmed)
}

/**
 * Debounce: espera 300ms después de que el usuario
 * deje de escribir antes de disparar la búsqueda.
 * Esto evita hacer un request por cada tecla.
 */
watch(query, (newVal) => {
  clearTimeout(debounceTimer)
  emit('search', newVal)

  if (!newVal.trim()) {
    weatherStore.searchCitiesAction('')
    return
  }

  debounceTimer = setTimeout(() => {
    handleSearch()
  }, 300)
})

/**
 * Limpia el input (se llama desde el padre tras seleccionar ciudad).
 */
function clearInput() {
  query.value = ''
}

defineExpose({ clearInput })
</script>

<template>
  <div class="city-search">
    <div class="city-search__wrapper">
      <span class="city-search__icon" aria-hidden="true">🔍</span>
      <input
        id="city-input"
        v-model="query"
        type="text"
        class="city-search__input"
        placeholder="Buscar ciudad..."
        autocomplete="off"
        aria-label="Buscar ciudad"
        @keyup.enter="handleSearch"
      />
    </div>
  </div>
</template>

<style scoped>
.city-search {
  width: 100%;
}

.city-search__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.city-search__icon {
  position: absolute;
  left: var(--space-md);
  color: var(--color-text-placeholder);
  font-size: 1rem;
  pointer-events: none;
}

.city-search__input {
  width: 100%;
  padding: var(--space-md) var(--space-md) var(--space-md) 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  min-height: 44px;
  transition: all var(--transition-base);
}

.city-search__input::placeholder {
  color: var(--color-text-placeholder);
}

.city-search__input:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary-light);
}
</style>
