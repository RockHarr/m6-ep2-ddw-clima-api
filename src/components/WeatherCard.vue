<script setup>
/**
 * WeatherCard — Tarjeta individual de pronóstico.
 * Muestra: emoji del clima, label, min/max, fecha formateada.
 * La tarjeta de Hoy además muestra highlights (viento, UV).
 */
defineProps({
  dateFormatted: { type: String, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  weatherLabel: { type: String, required: true },
  weatherIcon: { type: String, required: true },
  windSpeed: { type: Number, default: 0 },
  uvIndex: { type: Number, default: 0 },
  isToday: { type: Boolean, default: false }
})
</script>

<template>
  <article class="weather-card" :class="{ 'weather-card--today': isToday }">
    <h3 class="weather-card__title">{{ isToday ? 'Hoy' : 'Mañana' }}</h3>

    <div class="weather-card__icon" aria-hidden="true">{{ weatherIcon }}</div>

    <p class="weather-card__label">{{ weatherLabel }}</p>

    <div class="weather-card__temps">
      <span class="weather-card__temp weather-card__temp--min">
        Min <strong>{{ min }}°C</strong>
      </span>
      <span class="weather-card__separator" aria-hidden="true">/</span>
      <span class="weather-card__temp weather-card__temp--max">
        Max <strong>{{ max }}°C</strong>
      </span>
    </div>

    <p class="weather-card__date">{{ dateFormatted }}</p>

    <!-- Highlights solo en la tarjeta de Hoy -->
    <div v-if="isToday" class="weather-card__highlights">
      <span class="weather-card__chip" aria-label="Velocidad del viento">
        💨 {{ windSpeed }} km/h
      </span>
      <span class="weather-card__chip" aria-label="Índice UV">
        ☀️ UV {{ uvIndex }}
      </span>
    </div>
  </article>
</template>

<style scoped>
.weather-card {
  background: var(--color-card);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  transition: transform var(--transition-base),
              box-shadow var(--transition-base);
  position: relative;
  overflow: hidden;
  animation: slide-up 0.5s ease-out backwards;
}

/* Stagger animation for 2nd card */
.weather-card:nth-child(2) {
  animation-delay: 0.1s;
}

/* Borde gradiente sutil */
.weather-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px; /* Un poco más grueso */
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.weather-card:hover {
  transform: translateY(-6px); /* Más levantamiento */
  box-shadow: var(--shadow-lg);
}

.weather-card__title {
  font-size: var(--font-size-h3);
  font-weight: 600;
  color: var(--color-text);
}

.weather-card__icon {
  font-size: 5rem; /* Un poco más grande */
  line-height: 1;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2)); /* Sombra al emoji */
  animation: float 3s ease-in-out infinite;
}

.weather-card__label {
  font-size: var(--font-size-body);
  color: var(--color-text-muted);
  font-weight: 500;
}

.weather-card__temps {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: var(--font-size-h2); /* Más grande */
  font-weight: 700;
}

.weather-card__temp--min {
  color: #94a3b8; /* Gris azulado más suave */
}

.weather-card__temp--max {
  color: var(--color-text);
}

.weather-card__separator {
  color: var(--color-surface);
  font-weight: 300;
}

.weather-card__date {
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

.weather-card__highlights {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  flex-wrap: wrap;
  justify-content: center;
}

.weather-card__chip {
  background: rgba(255, 255, 255, 0.05); /* Más sutil */
  border: 1px solid var(--color-surface);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
