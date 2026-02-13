<script setup>
/**
 * SidebarCityCard — Tarjeta rica para las ciudades en la barra lateral.
 * Muestra nombre, hora local, temperatura y condición con fondo dinámico.
 */
import { computed, onMounted, ref, onUnmounted, watch } from 'vue'
import { wmoCodeToLabel } from '@/utils/transform.js'
import WeatherAmbient from '@/components/WeatherAmbient.vue'

const props = defineProps({
  city: { type: Object, required: true },
  weather: { type: Object, default: null }, // Datos opcionales para vista previa
  isActive: { type: Boolean, default: false },
  removable: { type: Boolean, default: false }
})

defineEmits(['select', 'remove'])

// Reloj local basado en el timezone de la ciudad (si está disponible)
const currentTime = ref('')
let timer = null

function updateTime() {
  if (!props.weather?.timezone) {
    currentTime.value = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    return
  }
  
  currentTime.value = new Intl.DateTimeFormat('es-ES', {
    timeZone: props.weather.timezone,
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())
}

watch(() => props.weather?.timezone, (tz) => {
  if (tz) updateTime()
})

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const currentTemp = computed(() => {
  if (!props.weather?.daily?.[0]) return '--'
  return props.weather.daily[0].max
})

const condition = computed(() => {
  if (!props.weather?.daily?.[0]) return 'Cargando...'
  return props.weather.daily[0].weatherLabel
})

const range = computed(() => {
  if (!props.weather?.daily?.[0]) return ''
  return `Máx: ${props.weather.daily[0].max}° Mín: ${props.weather.daily[0].min}°`
})

const themeClass = computed(() => {
  if (!props.weather?.daily?.[0]) return 'theme--default'
  const label = props.weather.daily[0].weatherLabel.toLowerCase()
  if (label.includes('despejado')) return 'theme--sunny'
  if (label.includes('nublado')) return 'theme--cloudy'
  if (label.includes('lluvia') || label.includes('chubascos')) return 'theme--rainy'
  if (label.includes('nieve') || label.includes('nevada') || label.includes('granizo')) return 'theme--snowy'
  if (label.includes('tormenta')) return 'theme--stormy'
  if (label.includes('niebla') || label.includes('llovizna')) return 'theme--foggy'
  return 'theme--default'
})

// Clave de tema para WeatherAmbient (sin prefijo 'theme--')
const ambientTheme = computed(() => themeClass.value.replace('theme--', ''))
</script>

<template>
  <div 
    class="city-card" 
    :class="[themeClass, { 'city-card--active': isActive }]"
    @click="$emit('select', city)"
  >
    <div class="city-card__main">
      <div class="city-card__info">
        <h4 class="city-card__name">{{ city.name }}</h4>
        <div class="city-card__location">
          {{ city.admin ? `${city.admin}, ` : '' }}{{ city.country }}
        </div>
        <span class="city-card__time">{{ currentTime }}</span>
      </div>
      <div class="city-card__temp">{{ currentTemp }}°</div>
    </div>
    
    <div class="city-card__footer">
      <span class="city-card__condition">{{ condition }}</span>
      <span class="city-card__range">{{ range }}</span>
    </div>

    <button
      v-if="removable && !isActive"
      class="city-card__remove"
      @click.stop="$emit('remove', city.id)"
      title="Eliminar de favoritos"
    >✕</button>

    <WeatherAmbient :theme="ambientTheme" :timezone="props.weather?.timezone" />
  </div>
</template>

<style scoped>
.city-card {
  position: relative;
  width: 100%;
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  color: white;
  cursor: pointer;
  transition: all var(--transition-base);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: var(--space-md);
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.city-card:hover {
  transform: scale(1.02);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.city-card--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

/* Background Themes sutiles */
.theme--sunny   { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
.theme--cloudy  { background: linear-gradient(135deg, #64748b, #475569); }
.theme--rainy   { background: linear-gradient(135deg, #334155, #1e293b); }
.theme--snowy   { background: linear-gradient(135deg, #94a3b8, #64748b); }
.theme--stormy  { background: linear-gradient(135deg, #1e1b4b, #0f172a); }
.theme--foggy   { background: linear-gradient(135deg, #475569, #334155); }
.theme--default { background: rgba(255, 255, 255, 0.05); }

/* Contenido por encima del WeatherAmbient */
.city-card__main,
.city-card__footer {
  position: relative;
  z-index: 1;
}

.city-card__main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.city-card__info {
  display: flex;
  flex-direction: column;
}

.city-card__name {
  font-size: 1.1rem;
  font-weight: var(--font-weight-bold);
  margin: 0;
  letter-spacing: -0.01em;
}

.city-card__location {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 2px;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.city-card__time {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-normal);
  opacity: 0.8;
}

.city-card__temp {
  font-size: 2.5rem;
  font-weight: var(--font-weight-thin);
  line-height: 1;
}

.city-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: var(--space-md);
}

.city-card__condition {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.city-card__range {
  font-size: 0.75rem;
  opacity: 0.8;
}

.city-card__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: background 0.2s;
}

.city-card:hover .city-card__remove {
  display: flex;
}

.city-card__remove:hover {
  background: var(--color-error);
}
</style>
