<template>
  <div 
    class="dashboard-layout" 
    :class="`theme--${currentTheme}`"
  >
    <!-- Sidebar -->
    <aside class="sidebar glass">
      <div class="sidebar__header">
        <h2 class="sidebar__title">ClimaApp</h2>
        <div class="sidebar__search">
          <CitySearch ref="citySearchRef" @search="handleSearchUpdate" />
          <button
            class="geo-btn"
            :disabled="weatherStore.statusGeo === 'loading'"
            @click="showGeoBanner = true"
            title="Usar mi ubicación"
          >
            <span>{{ weatherStore.statusGeo === 'loading' ? '⏳' : '📍' }}</span>
            <span class="geo-btn__label">Mi ubicación</span>
          </button>
          <Transition name="fade">
            <div v-if="showGeoBanner" class="geo-banner">
              <p>Usaremos tu ubicación para mostrarte el clima local.</p>
              <div class="geo-banner__actions">
                <button class="geo-banner__confirm" @click="handleGeoClick">Permitir</button>
                <button class="geo-banner__cancel" @click="showGeoBanner = false">Cancelar</button>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <div class="sidebar__content">
        <CityResults :query="searchQuery" :mobileHidden="!searchQuery" @select="handleCitySelect" />

        <section class="sidebar__favorites">
          <h3 class="sidebar__section-title">⭐ Mis Ciudades</h3>
          <div v-if="weatherStore.favorites.length > 0" class="sidebar__list">
            <TransitionGroup name="list">
              <SidebarCityCard
                v-for="fav in weatherStore.favorites"
                :key="fav.id"
                :city="fav"
                :weather="weatherStore.favoritesWeather[fav.id]"
                :isActive="weatherStore.selectedCity?.id === fav.id"
                :removable="true"
                @select="handleCitySelect"
                @remove="weatherStore.removeFavorite"
              />
            </TransitionGroup>
          </div>
          <p v-else class="sidebar__favorites-empty">
            Guarda ciudades para acceder rápido usando ★ en el clima.
          </p>
        </section>
      </div>

      <div class="sidebar__footer">
        <button class="logout-btn" @click="handleLogout">
          <span>Cerrar Sesión</span>
          <span class="logout-icon">↪</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <Transition name="fade" mode="out-in">
        <div v-if="!weatherStore.selectedCity && weatherStore.statusWeather === 'idle'" class="empty-state" key="empty">
          <div class="empty-state__icon">🌤️</div>
          <ShinyText text="Bienvenido a ClimaApp" :speed="4" class="empty-state__title" />
          <p>Selecciona una ciudad o busca una nueva en la barra lateral.</p>
        </div>

        <div v-else-if="weatherStore.statusWeather === 'loading'" class="loading-state" key="loading">
          <div class="loader"></div>
        </div>

        <div v-else-if="weatherStore.statusWeather === 'error'" class="empty-state" key="error">
          <div class="empty-state__icon">⚠️</div>
          <h1>Error al cargar el clima</h1>
          <p>{{ weatherStore.errorWeather }}</p>
          <button class="retry-btn" @click="weatherStore.fetchWeather()">Reintentar</button>
        </div>

        <div v-else-if="weatherStore.statusWeather === 'success'" class="bento-grid" key="content">
          <!-- Widget: Ciudad Actual (Hero) -->
          <article class="widget widget--hero animate-float">
            <!-- Favorite CTA Button -->
            <button
              class="favorite-toggle"
              :class="{ 'favorite-toggle--active': weatherStore.isFavorite(weatherStore.selectedCity.id) }"
              @click="toggleFavorite"
              :title="weatherStore.isFavorite(weatherStore.selectedCity.id) ? 'Quitar de favoritos' : 'Guardar ciudad'"
            >
              <span class="favorite-icon">{{ weatherStore.isFavorite(weatherStore.selectedCity.id) ? '★' : '☆' }}</span>
              <span class="favorite-label">{{ weatherStore.isFavorite(weatherStore.selectedCity.id) ? 'Ciudad guardada' : 'Guardar ciudad' }}</span>
            </button>

            <div class="widget--hero__main">
              <h1 class="city-name">{{ weatherStore.selectedCity.name }}</h1>
              <p class="city-origin">{{ weatherStore.selectedCity.admin ? `${weatherStore.selectedCity.admin}, ` : '' }}{{ weatherStore.selectedCity.country }}</p>
              <div class="current-temp">{{ weatherStore.forecast.daily[0].max }}°</div>
              <div class="current-condition">{{ weatherStore.forecast.daily[0].weatherLabel }}</div>
              <div class="range">Máx: {{ weatherStore.forecast.daily[0].max }}° Mín: {{ weatherStore.forecast.daily[0].min }}°</div>
            </div>

            <!-- Wind + UV inline en el hero -->
            <div class="hero-details">
              <div class="hero-detail-item">
                <span class="hero-detail-icon">💨</span>
                <span class="hero-detail-value">{{ weatherStore.forecast.daily[0].windSpeed }} <small>km/h</small></span>
              </div>
              <div class="hero-detail-divider"></div>
              <div class="hero-detail-item">
                <span class="hero-detail-icon">☀️</span>
                <span class="hero-detail-value">UV {{ weatherStore.forecast.daily[0].uvIndex }} <small>{{ uvLevel(weatherStore.forecast.daily[0].uvIndex) }}</small></span>
              </div>
            </div>

            <div class="weather-graphic" :class="`graphic--${currentTheme}`"></div>
          </article>

          <!-- Widget: Pronóstico por Horas -->
          <article class="widget widget--hourly glass">
            <h3 class="widget__title">🕒 Próximas 24 horas</h3>
            <div class="hourly-list">
              <div v-for="h in weatherStore.forecast.hourly" :key="h.time" class="hourly-item">
                <span class="hourly-item__time">{{ h.time }}</span>
                <span class="hourly-item__icon">{{ h.icon }}</span>
                <span class="hourly-item__temp">{{ h.temp }}°</span>
              </div>
            </div>
          </article>

          <!-- Widget: Pronóstico 7 días -->
          <article class="widget widget--forecast glass">
            <h3 class="widget__title">📅 Pronóstico 7 Días</h3>
            <div class="forecast-list">
              <WeatherCard
                v-for="(day, index) in weatherStore.forecast.daily"
                :key="day.date"
                v-bind="day"
                :isToday="index === 0"
              />
            </div>
          </article>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWeatherStore } from '@/stores/weather.store.js'
import { useAuthStore } from '@/stores/auth.store.js'
import CitySearch from '@/components/CitySearch.vue'
import CityResults from '@/components/CityResults.vue'
import WeatherCard from '@/components/WeatherCard.vue'
import SidebarCityCard from '@/components/SidebarCityCard.vue'
import ShinyText from '@/components/ShinyText.vue'

const weatherStore = useWeatherStore()
const authStore = useAuthStore()
const router = useRouter()
const citySearchRef = ref(null)
const searchQuery = ref('')
const showGeoBanner = ref(false)

function handleSearchUpdate(query) {
  searchQuery.value = query
}

async function handleCitySelect(city) {
  searchQuery.value = ''
  await weatherStore.selectCity(city)
  citySearchRef.value?.clearInput()
}

function toggleFavorite() {
  const city = weatherStore.selectedCity
  if (!city) return

  if (weatherStore.isFavorite(city.id)) {
    weatherStore.removeFavorite(city.id)
  } else {
    weatherStore.addFavorite(city)
  }
}

function handleLogout() {
  authStore.logout()
  weatherStore.clearAll()
  router.push('/login')
}

function uvLevel(index) {
  if (index <= 2) return 'Bajo'
  if (index <= 5) return 'Moderado'
  if (index <= 7) return 'Alto'
  if (index <= 10) return 'Muy alto'
  return 'Extremo'
}

const currentTheme = computed(() => {
  if (!weatherStore.forecast?.daily?.[0]) return 'default'
  const label = weatherStore.forecast.daily[0].weatherLabel.toLowerCase()
  if (label.includes('despejado')) return 'sunny'
  if (label.includes('nublado')) return 'cloudy'
  if (label.includes('lluvia') || label.includes('chubascos')) return 'rainy'
  if (label.includes('nieve')) return 'snowy'
  if (label.includes('tormenta')) return 'stormy'
  return 'default'
})

function handleGeoClick() {
  showGeoBanner.value = false
  weatherStore.geolocateCity()
}

onMounted(async () => {
  weatherStore.loadFavorites()
  weatherStore.searchCitiesAction('')
  await weatherStore.loadLastCity()
})
</script>

<style scoped>
.animate-float {
  animation: var(--anim-float);
}

/* Themes Implementation */
.theme--sunny { background: var(--theme-clear-bg); }
.theme--cloudy { background: var(--theme-cloudy-bg); }
.theme--rainy { background: var(--theme-rainy-bg); }
.theme--snowy { background: var(--theme-snow-bg); }
.theme--stormy { background: var(--theme-storm-bg); }

.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  transition: background var(--transition-slow);
}

.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--space-xl);
  border-right: 1px solid var(--glass-border);
  z-index: 10;
  transition: transform var(--transition-base);
}

.sidebar__header {
  margin-bottom: var(--space-2xl);
}

.sidebar__title {
  font-size: var(--font-size-h2);
  font-weight: 800;
  margin-bottom: var(--space-lg);
  background: linear-gradient(to right, white, var(--color-text-muted));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar__content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

.sidebar__section-title {
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-md);
}

.sidebar__list {
  display: flex;
  flex-direction: column;
}

.sidebar__item-remove {
  opacity: 0;
  transition: opacity var(--transition-fast);
  color: var(--color-text-muted);
  padding: 4px;
}

.sidebar__item:hover .sidebar__item-remove {
  opacity: 1;
}

.sidebar__footer {
  padding-top: var(--space-xl);
  border-top: 1px solid var(--glass-border);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: color var(--transition-fast);
}

.logout-btn:hover {
  color: var(--color-error);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3xl);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state {
  margin-top: 10vh;
  text-align: center;
  max-width: 400px;
}

.empty-state__icon {
  font-size: 5rem;
  margin-bottom: var(--space-xl);
  animation: var(--anim-float);
}

.bento-grid {
  width: 100%;
  max-width: 1000px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: var(--space-2xl); /* More breathing room */
}

.widget {
  padding: var(--space-2xl);
  border-radius: var(--radius-xl);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.widget:hover {
  transform: translateY(-4px);
  box-shadow: var(--glass-shadow);
}

.widget--hero {
  grid-column: 1 / -1;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 280px;
  position: relative; /* For favorite toggle positioning */
}

.favorite-toggle {
  position: absolute;
  top: var(--space-xl);
  right: var(--space-xl);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: white;
  height: 44px;
  padding: 0 var(--space-lg);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  z-index: 5;
  white-space: nowrap;
}

.favorite-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.favorite-toggle--active {
  background: rgba(251, 191, 36, 0.15);
  border-color: #fbbf24;
}

.favorite-toggle--active .favorite-icon {
  color: #fbbf24;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
}

.favorite-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.favorite-label {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 480px) {
  .favorite-label { display: none; }
  .favorite-toggle { width: 44px; padding: 0; justify-content: center; border-radius: 50%; }
}

.city-name {
  font-size: 2.8rem;
  font-weight: var(--font-weight-thin);
  letter-spacing: -0.02em;
}

.city-origin {
  font-size: var(--font-size-h3);
  opacity: 0.6;
  margin-top: -var(--space-sm);
  margin-bottom: var(--space-md);
  font-weight: var(--font-weight-normal);
}

.current-temp {
  font-size: 8rem;
  font-weight: var(--font-weight-thin);
  line-height: 1;
  margin: var(--space-xs) 0;
  letter-spacing: -0.05em;
}

.current-condition {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

.range {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-normal);
  margin-top: var(--space-sm);
}

.widget--hourly {
  grid-column: 1 / -1;
  padding: var(--space-xl);
  order: 2;
}

.hourly-list {
  display: flex;
  gap: var(--space-xl);
  overflow-x: auto;
  padding: var(--space-md) 0;
  scrollbar-width: none; /* Firefox */
}

.hourly-list::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.hourly-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  min-width: 60px;
}

.hourly-item__time {
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.hourly-item__icon {
  font-size: 1.5rem;
}

.hourly-item__temp {
  font-weight: var(--font-weight-bold);
}

.widget--forecast {
  grid-column: 1 / -1;
  order: 3;
}

.widget__title {
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
  text-transform: uppercase;
  margin-bottom: var(--space-xl);
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Hero details strip (Wind + UV) */
.hero-details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xl);
  margin-top: var(--space-lg);
  padding: var(--space-md) var(--space-2xl);
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.hero-detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.hero-detail-icon {
  font-size: 1rem;
}

.hero-detail-value {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
}

.hero-detail-value small {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-muted);
  margin-left: 2px;
}

.hero-detail-divider {
  width: 1px;
  height: 20px;
  background: var(--glass-border);
}

/* Geo button */
.geo-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  margin-top: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
  border-radius: var(--radius-md);
  transition: color var(--transition-fast), background var(--transition-fast);
  min-height: 36px;
}

.geo-btn:hover:not(:disabled) {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.05);
}

.geo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.geo-btn__label {
  font-size: var(--font-size-small);
}

/* Geo banner */
.geo-banner {
  margin-top: var(--space-sm);
  padding: var(--space-md);
  background: rgba(67, 97, 238, 0.15);
  border: 1px solid var(--color-primary-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
}

.geo-banner p {
  margin-bottom: var(--space-md);
  line-height: 1.4;
}

.geo-banner__actions {
  display: flex;
  gap: var(--space-sm);
}

.geo-banner__confirm {
  flex: 1;
  padding: var(--space-sm);
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  transition: opacity var(--transition-fast);
}

.geo-banner__confirm:hover { opacity: 0.85; }

.geo-banner__cancel {
  flex: 1;
  padding: var(--space-sm);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-small);
  transition: background var(--transition-fast);
}

.geo-banner__cancel:hover { background: rgba(255, 255, 255, 0.1); }

/* Favorites empty state */
.sidebar__favorites-empty {
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  line-height: 1.5;
  opacity: 0.7;
}

/* Empty state title */
.empty-state__title {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  display: block;
  margin-bottom: var(--space-lg);
}

@media (max-width: 1024px) {
  .dashboard-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--glass-border);
  }
  .main-content {
    padding: var(--space-xl);
  }
}

.retry-btn {
  margin-top: var(--space-xl);
  padding: var(--space-md) var(--space-2xl);
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: opacity var(--transition-fast);
}

.retry-btn:hover {
  opacity: 0.85;
}

@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
