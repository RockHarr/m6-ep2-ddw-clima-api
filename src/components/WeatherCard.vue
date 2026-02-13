<template>
  <div class="forecast-item" :class="{ 'forecast-item--today': isToday }">
    <span class="forecast-item__day">{{ isToday ? 'Hoy' : shortDay }}</span>
    <span class="forecast-item__icon" :title="weatherLabel">{{ weatherIcon }}</span>
    
    <div class="forecast-item__temps">
      <span class="temp temp--min">{{ min }}°</span>
      
      <!-- Visual Temp Bar -->
      <div class="temp-bar">
        <div class="temp-bar__track"></div>
        <div class="temp-bar__range" :style="rangeStyle"></div>
      </div>
      
      <span class="temp temp--max">{{ max }}°</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  date: { type: String, required: true },
  dateFormatted: { type: String, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  weatherLabel: { type: String, required: true },
  weatherIcon: { type: String, required: true },
  isToday: { type: Boolean, default: false }
})

// Extrae el día abreviado o nombre del día
const shortDay = computed(() => {
  const parts = props.dateFormatted.split(' ')
  return parts[0].substring(0, 3)
})

// Calcula la posición y ancho de la barra (ejecución mock simple para demostrar visual)
// En un sistema real usaríamos la escala global de min/max del día de todos los 7 días
const rangeStyle = computed(() => {
  // Mock logic: asumimos un rango de 0 a 40 para la visualización
  const left = (props.min / 40) * 100
  const width = ((props.max - props.min) / 40) * 100
  
  return {
    left: `${Math.max(0, left)}%`,
    width: `${Math.min(100 - left, width)}%`
  }
})
</script>

<style scoped>
.forecast-item {
  display: grid;
  grid-template-columns: 60px 40px 1fr;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.forecast-item:last-child {
  border-bottom: none;
}

.forecast-item__day {
  font-weight: 600;
  text-transform: capitalize;
}

.forecast-item__icon {
  font-size: 1.5rem;
  text-align: center;
}

.forecast-item__temps {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  justify-content: flex-end;
}

.temp {
  font-weight: 500;
  width: 30px;
  text-align: right;
}

.temp--min {
  color: var(--color-text-muted);
}

/* Temp Bar styling */
.temp-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  position: relative;
  overflow: hidden;
  max-width: 100px;
}

.temp-bar__range {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #f59e0b);
  border-radius: var(--radius-full);
}

@media (max-width: 480px) {
  .temp-bar {
    display: none;
  }
}
</style>
