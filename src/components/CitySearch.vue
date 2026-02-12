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
  if (!newVal.trim()) return

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
    <label for="city-input" class="city-search__label">Buscar ciudad</label>
    <div class="city-search__row">
      <input
        id="city-input"
        v-model="query"
        type="text"
        class="city-search__input"
        placeholder="Ej: Santiago, Madrid, Tokyo..."
        autocomplete="off"
        @keyup.enter="handleSearch"
      />
      <button
        class="city-search__btn"
        @click="handleSearch"
        :disabled="!query.trim()"
        aria-label="Buscar ciudad"
      >
        Buscar
      </button>
    </div>
  </div>
</template>

<style scoped>
.city-search {
  width: 100%;
}

.city-search__label {
  display: block;
  font-size: var(--font-size-small);
  font-weight: 500;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}

.city-search__row {
  display: flex;
  gap: var(--space-md);
}

.city-search__input {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-card);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  color: var(--color-text);
  min-height: 44px;
  transition: border-color var(--transition-fast),
              box-shadow var(--transition-fast);
}

.city-search__input::placeholder {
  color: var(--color-text-placeholder);
}

.city-search__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
  outline: none;
}

.city-search__btn {
  padding: var(--space-md) var(--space-xl);
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  border-radius: var(--radius-md);
  min-height: 44px;
  transition: background-color var(--transition-fast),
              transform var(--transition-fast);
}

.city-search__btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.city-search__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
