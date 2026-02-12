<script setup>
/**
 * WeatherCards — Contenedor de las tarjetas Hoy / Mañana.
 * Maneja los estados de loading/error/empty del pronóstico.
 * Renderiza 2 WeatherCard (hoy y mañana).
 */
import { useWeatherStore } from '@/stores/weather.store.js'
import WeatherCard from './WeatherCard.vue'
import UiAlert from './UiAlert.vue'
import LoadingSkeleton from './LoadingSkeleton.vue'

const weatherStore = useWeatherStore()
</script>

<template>
  <section class="weather-cards" aria-label="Pronóstico del clima">
    <!-- Ciudad seleccionada -->
    <div v-if="weatherStore.selectedCity" class="weather-cards__header">
      <h2 class="weather-cards__city">
        {{ weatherStore.selectedCity.name }}<template v-if="weatherStore.selectedCity.country">, {{ weatherStore.selectedCity.country }}</template>
      </h2>
      <button
        class="weather-cards__fav-btn"
        @click="weatherStore.isFavorite(weatherStore.selectedCity.id)
          ? weatherStore.removeFavorite(weatherStore.selectedCity.id)
          : weatherStore.addFavorite(weatherStore.selectedCity)"
        :aria-label="weatherStore.isFavorite(weatherStore.selectedCity.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
      >
        {{ weatherStore.isFavorite(weatherStore.selectedCity.id) ? '★' : '☆' }}
      </button>
    </div>

    <!-- Feedback favoritos -->
    <p
      v-if="weatherStore.favoritesMessage"
      class="weather-cards__fav-msg"
      role="alert"
    >
      {{ weatherStore.favoritesMessage }}
    </p>

    <!-- Loading -->
    <LoadingSkeleton v-if="weatherStore.statusWeather === 'loading'" type="card" />

    <!-- Error -->
    <UiAlert
      v-else-if="weatherStore.statusWeather === 'error'"
      :message="weatherStore.errorWeather"
      type="error"
      :retryable="true"
      @retry="weatherStore.fetchWeather"
    />

    <!-- Cards -->
    <TransitionGroup
      v-else-if="weatherStore.hasForecast"
      name="list"
      tag="div"
      class="weather-cards__grid"
    >
      <WeatherCard
        v-for="(day, index) in weatherStore.forecast"
        :key="day.date"
        :dateFormatted="day.dateFormatted"
        :min="day.min"
        :max="day.max"
        :weatherLabel="day.weatherLabel"
        :weatherIcon="day.weatherIcon"
        :windSpeed="day.windSpeed"
        :uvIndex="day.uvIndex"
        :isToday="index === 0"
      />
    </TransitionGroup>
  </section>
</template>

<style scoped>
.weather-cards__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.weather-cards__city {
  font-size: var(--font-size-h1);
  font-weight: 700;
  color: var(--color-text);
}

.weather-cards__fav-btn {
  font-size: 1.5rem;
  color: var(--color-warning);
  padding: var(--space-sm);
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: transform var(--transition-fast);
}

.weather-cards__fav-btn:hover {
  transform: scale(1.2);
}

.weather-cards__fav-msg {
  font-size: var(--font-size-small);
  color: var(--color-warning);
  margin-bottom: var(--space-lg);
}

.weather-cards__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xl);
}

@media (max-width: 640px) {
  .weather-cards__grid {
    grid-template-columns: 1fr;
  }

  .weather-cards__city {
    font-size: var(--font-size-h2);
  }
}
</style>
