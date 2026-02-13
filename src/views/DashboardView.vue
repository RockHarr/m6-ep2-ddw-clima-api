<template>
  <div 
    class="dashboard-layout" 
    :class="`theme--${currentTheme}`"
  >
    <!-- Sidebar -->
    <aside ref="sidebarRef" class="sidebar glass" :class="{ 'sidebar--open': isMobileMenuOpen }">
      <!-- Mobile Backdrop -->
      <div 
        class="sidebar__backdrop" 
        v-if="isMobileMenuOpen"
        @click="isMobileMenuOpen = false"
      ></div>

      <div class="sidebar__header">
        <div class="sidebar__brand-row">
          <div class="sidebar__brand">
            <AppLogo :size="32" />
            <h2 class="sidebar__title">ClimaApp</h2>
          </div>
          <button 
            class="mobile-toggle" 
            @click="toggleMobileMenu"
            aria-label="Menú principal"
          >
            <span class="hamburger-icon">{{ isMobileMenuOpen ? '✕' : '☰' }}</span>
          </button>
        </div>
        <p class="sidebar__welcome">Hola, {{ greetingName }}!</p>

        <div class="sidebar__search">
          <div class="sidebar__search-row">
            <CitySearch
              ref="citySearchRef"
              @search="handleSearchUpdate"
              @submit="handleSearchSubmit"
            />
            <button
              class="geo-btn geo-btn--inline"
              :disabled="weatherStore.statusGeo === 'loading'"
              @click="showGeoBanner = true"
              title="Usar mi ubicación"
              aria-label="Usar mi ubicación"
            >
              <span>{{ weatherStore.statusGeo === 'loading' ? '⏳' : '📍' }}</span>
              <span class="geo-btn__label">Mi ubicación</span>
            </button>
          </div>
          <CityResults
            :query="searchQuery"
            :mobileHidden="!searchQuery"
            :searchOnly="true"
            @select="handleCitySelect"
          />
          <Transition name="fade">
            <div v-if="showGeoBanner" class="geo-banner">
              <p>Usaremos tu ubicación para mostrarte el clima local.</p>
              <div class="geo-banner__actions">
                <button class="geo-banner__confirm" @click="handleGeoClick">Permitir</button>
                <button class="geo-banner__cancel" @click="showGeoBanner = false">Cancelar</button>
              </div>
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="weatherStore.geoMessage" class="geo-feedback" role="alert">
              <span class="geo-feedback__text">{{ weatherStore.geoMessage }}</span>
              <button class="geo-feedback__close" @click="weatherStore.geoMessage = ''" aria-label="Cerrar">✕</button>
            </div>
          </Transition>
        </div>
      </div>

      <div class="sidebar__drawer-content">
        <div class="sidebar__content">
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
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Ambient ocupa todo el panel de contenido cuando hay clima cargado -->
      <WeatherAmbient
        v-if="weatherStore.statusWeather === 'success'"
        :theme="currentTheme"
        :timezone="weatherStore.forecast?.timezone"
      />
      <Transition name="fade">
        <div
          v-if="weatherStore.favoritesMessage"
          class="favorites-feedback"
          role="alert"
          aria-live="assertive"
        >
          {{ weatherStore.favoritesMessage }}
        </div>
      </Transition>

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
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWeatherStore } from '@/stores/weather.store.js'
import { useAuthStore } from '@/stores/auth.store.js'
import CitySearch from '@/components/CitySearch.vue'
import CityResults from '@/components/CityResults.vue'
import WeatherCard from '@/components/WeatherCard.vue'
import SidebarCityCard from '@/components/SidebarCityCard.vue'
import ShinyText from '@/components/ShinyText.vue'
import WeatherAmbient from '@/components/WeatherAmbient.vue'
import AppLogo from '@/components/AppLogo.vue'

const weatherStore = useWeatherStore()
const authStore = useAuthStore()
const router = useRouter()
const sidebarRef = ref(null)
const citySearchRef = ref(null)
const searchQuery = ref('')
const showGeoBanner = ref(false)

// Mobile Menu State
const isMobileMenuOpen = ref(false)
const touchStartX = ref(0)
const touchEndX = ref(0)
let swipeTarget = null

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function handleSearchUpdate(query) {
  searchQuery.value = query
}

function handleSearchSubmit(query) {
  if (!query) return
  searchQuery.value = query
}

async function handleCitySelect(city) {
  searchQuery.value = ''
  await weatherStore.selectCity(city)
  citySearchRef.value?.clearInput()
  // Close menu after selection
  isMobileMenuOpen.value = false
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
  if (label.includes('nieve') || label.includes('nevada') || label.includes('granizo')) return 'snowy'
  if (label.includes('tormenta')) return 'stormy'
  if (label.includes('niebla') || label.includes('llovizna')) return 'foggy'
  return 'default'
})

const greetingName = computed(() => authStore.currentUser || 'profe')

function handleGeoClick() {
  showGeoBanner.value = false
  weatherStore.geolocateCity()
}

// Swipe detection logic
function handleTouchStart(e) {
  touchStartX.value = e.changedTouches ? e.changedTouches[0].screenX : e.screenX
}

function handleTouchEnd(e) {
  touchEndX.value = e.changedTouches ? e.changedTouches[0].screenX : e.screenX
  handleSwipe()
}

function handleSwipe() {
  if (!isMobileMenuOpen.value) return
  // Swipe Left to close (dragged at least 50px left)
  if (touchStartX.value - touchEndX.value > 50) {
    isMobileMenuOpen.value = false
  }
}

onMounted(async () => {
  weatherStore.loadFavorites()
  weatherStore.searchCitiesAction('')

  // Mostrar saludo 4s antes de cargar la última ciudad visitada
  const hasLastCity = !!localStorage.getItem('clima_last_city')
  if (hasLastCity) {
    await new Promise(resolve => setTimeout(resolve, 4000))
  }
  await weatherStore.loadLastCity()
  
  // Swipe solo en dispositivos táctiles y limitado al sidebar
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  if (isCoarsePointer && sidebarRef.value) {
    swipeTarget = sidebarRef.value
    swipeTarget.addEventListener('touchstart', handleTouchStart, { passive: true })
    swipeTarget.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
})

onUnmounted(() => {
  if (swipeTarget) {
    swipeTarget.removeEventListener('touchstart', handleTouchStart)
    swipeTarget.removeEventListener('touchend', handleTouchEnd)
    swipeTarget = null
  }
})
</script>

<style scoped>
.animate-float {
  animation: var(--anim-float);
}

/* Themes Implementation */
.theme--sunny  { background: var(--theme-clear-bg);  }
.theme--cloudy { background: var(--theme-cloudy-bg); }
.theme--rainy  { background: var(--theme-rainy-bg);  }
.theme--snowy  { background: var(--theme-snow-bg);   }
.theme--stormy { background: var(--theme-storm-bg);  }
.theme--foggy  { background: var(--theme-cloudy-bg); }

.dashboard-layout {
  display: flex;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  overflow-x: clip;
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

.sidebar__brand-row {
  display: block;
}

.sidebar__drawer-content {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.mobile-toggle {
  display: none;
}

.sidebar__header {
  margin-bottom: var(--space-2xl);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.sidebar__title {
  font-size: var(--font-size-h2);
  font-weight: 800;
  margin-bottom: 0;
  background: linear-gradient(to right, white, var(--color-text-muted));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar__welcome {
  margin-top: -2px;
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-small);
  color: #dbeafe;
  font-weight: var(--font-weight-medium);
  opacity: 0.95;
}

.sidebar__search {
  position: relative;
  z-index: 120;
  overflow: visible;
}

.sidebar__search-row {
  display: block;
}

.sidebar__search-row .city-search {
  width: 100%;
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
  overflow-x: hidden;
  padding: var(--space-3xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative; /* Ancla el WeatherAmbient */
}

.empty-state {
  margin-top: 10vh;
  text-align: center;
  max-width: 400px;
  position: relative;
  z-index: 1;
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
  gap: var(--space-2xl);
  position: relative; /* Se ubica encima del WeatherAmbient */
  z-index: 1;
  min-width: 0;
}

.widget {
  padding: var(--space-2xl);
  border-radius: var(--radius-xl);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  min-width: 0;
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
  position: relative;
  /* Transparente: el ambient del main-content se ve a través */
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow: hidden;
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
  max-width: calc(100% - (var(--space-xl) * 2));
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
  background: rgba(15, 23, 42, 0.45) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  overflow: hidden;
}

.hourly-list {
  display: flex;
  gap: var(--space-xl);
  overflow-x: auto;
  padding: var(--space-md) 0;
  scrollbar-width: none; /* Firefox */
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
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
  background: rgba(15, 23, 42, 0.45) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  overflow: hidden;
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
  max-width: 100%;
  position: relative;
  z-index: 1;
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

.geo-btn span:first-child {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1;
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

.geo-btn--inline {
  width: 100%;
  margin-top: var(--space-sm);
  justify-content: flex-start;
  background: rgba(67, 97, 238, 0.3);
  border: 1px solid rgba(147, 197, 253, 0.45);
  color: #dbeafe;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25), 0 8px 20px rgba(30, 64, 175, 0.3);
}

.geo-btn--inline:hover:not(:disabled) {
  background: rgba(67, 97, 238, 0.45);
  color: #eff6ff;
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

/* Geo feedback (resultado de geolocación) */
.geo-feedback {
  margin-top: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: var(--radius-md);
  font-size: 0.72rem;
  color: #fde68a;
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  line-height: 1.4;
}

.geo-feedback__text {
  flex: 1;
}

.geo-feedback__close {
  flex-shrink: 0;
  color: rgba(253, 230, 138, 0.6);
  font-size: 10px;
  padding: 2px 4px;
  transition: color var(--transition-fast);
  margin-top: 1px;
}

.geo-feedback__close:hover {
  color: #fde68a;
}

.favorites-feedback {
  position: fixed;
  top: calc(env(safe-area-inset-top) + var(--space-md));
  left: 50%;
  transform: translateX(-50%);
  z-index: 220;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
  border: 1px solid rgba(167, 243, 208, 0.55);
  color: #f0fdf4;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  box-shadow: 0 10px 28px rgba(6, 95, 70, 0.4);
  max-width: min(92vw, 420px);
  text-align: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: none;
}

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

/* ═══════════════════════════════════════════════
   RESPONSIVE — Tablet & Mobile (≤1024px)
   Sidebar → barra fija (position:fixed) en la parte
   superior. El contenido se desplaza debajo.
   ═══════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .dashboard-layout {
    --mobile-header-offset: 156px;
  }

  .dashboard-layout {
    display: block;               /* Quitar flex para scroll natural de la página */
    height: auto !important;
    overflow: visible !important; /* La página entera scrollea */
  }

  /* Sidebar FIJO en la parte superior */
  .sidebar {
    position: fixed !important;
    top: 0;
    left: 0;
    right: 0;
    width: 100% !important;
    height: calc(var(--mobile-header-offset) + env(safe-area-inset-top)) !important;
    z-index: 100;
    border-right: none;
    border-bottom: 1px solid var(--glass-border);
    padding: calc(var(--space-sm) + env(safe-area-inset-top)) var(--space-lg) var(--space-sm);
    /* Fondo sólido opaco para que el contenido pase detrás */
    background: #0f172a !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .sidebar__header {
    margin-bottom: 0;
    height: auto;
    overflow: visible;
  }

  /* Ocultar inicialmente el contenido del drawer en mobile */
  .sidebar__drawer-content {
    position: fixed;
    left: 0;
    bottom: 0;
    width: min(360px, 88vw);
    background: #0f172a; /* Fondo sólido igual al header */
    z-index: 101; /* Encima del header y backdrop */
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    display: flex;
    flex-direction: column;
    /* Drawer debajo del header fijo */
    top: calc(var(--mobile-header-offset) + env(safe-area-inset-top));
    border-right: 1px solid var(--glass-border);
    box-shadow: 4px 0 24px rgba(0,0,0,0.5);
    padding-bottom: env(safe-area-inset-bottom);
    overflow: hidden;
  }

  /* Cuando el menú está abierto */
  .sidebar--open .sidebar__drawer-content {
    transform: translateX(0);
  }

  /* Backdrop oscuro */
  .sidebar__backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    z-index: 99;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .sidebar__content {
    display: flex !important; /* Restaurar display flex */
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--space-lg);
  }

  .sidebar__footer {
    display: flex !important; /* Restaurar display flex */
    padding: var(--space-lg);
    border-top: 1px solid var(--glass-border);
    background: #0f172a;
  }

  /* Ajustar branding row para alojar el toggle */
  .sidebar__brand-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: var(--space-sm);
  }

  .sidebar__brand {
    margin-bottom: 0; /* Reset */
  }

  /* Botón Hamburguesa */
  .mobile-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    border: 1px solid var(--glass-border);
    color: var(--color-text);
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .mobile-toggle:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .hamburger-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .main-content {
    /* Empujar contenido debajo del sidebar fijo */
    padding-top: calc(var(--mobile-header-offset) + env(safe-area-inset-top) + var(--space-md));
    padding-left: var(--space-lg);
    padding-right: var(--space-lg);
    padding-bottom: var(--space-xl);
    overflow-y: visible;
    overflow-x: hidden;
    min-height: calc(100dvh - var(--mobile-header-offset));
  }

  .geo-btn--inline {
    width: 46px;
    height: 46px;
    justify-content: center;
    padding: 0;
    margin-top: 0;
    border-radius: var(--radius-md);
  }

  .geo-btn--inline span:first-child {
    font-size: 1.25rem;
    text-shadow: 0 0 10px rgba(147, 197, 253, 0.45);
  }

  .geo-btn--inline .geo-btn__label {
    display: none;
  }

  .sidebar__search :deep(.city-search__input) {
    min-height: 44px;
    padding-top: var(--space-sm);
    padding-bottom: var(--space-sm);
    padding-right: 52px;
  }

  .sidebar__search-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .sidebar__search-row .city-search {
    flex: 1;
    min-width: 0;
  }

  .sidebar__search :deep(.city-search__mic) {
    width: 34px;
    height: 34px;
    right: 8px;
  }

  .favorites-feedback {
    top: calc(env(safe-area-inset-top) + var(--space-sm));
  }

  /* Desactivar hover lift en touch screens */
  .widget:hover {
    transform: none;
  }
}

/* ═══════════════════════════════════════════════
   RESPONSIVE — Mobile (≤768px)
   ═══════════════════════════════════════════════ */
@media (max-width: 768px) {
  .dashboard-layout {
    --mobile-header-offset: 148px;
  }

  .sidebar {
    padding: calc(var(--space-sm) + env(safe-area-inset-top)) var(--space-md) var(--space-sm);
  }

  .main-content {
    padding-top: calc(var(--mobile-header-offset) + env(safe-area-inset-top) + var(--space-md));
    padding-left: var(--space-md);
    padding-right: var(--space-md);
    overflow-x: hidden;
  }

  .favorites-feedback {
    max-width: calc(100vw - (var(--space-md) * 2));
  }

  .bento-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .widget {
    padding: var(--space-lg);
  }

  .widget--hero {
    min-height: auto;
    padding: var(--space-xl) var(--space-lg);
  }

  .widget--hero__main {
    padding-top: 28px;
  }

  .favorite-label {
    display: none;
  }

  .favorite-toggle {
    width: 44px;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
    right: var(--space-md);
  }

  .city-name {
    font-size: 1.8rem;
  }

  .city-origin {
    font-size: var(--font-size-small);
    margin-top: 0;
  }

  .current-temp {
    font-size: 4rem;
  }

  .current-condition {
    font-size: var(--font-size-body);
  }

  .hero-details {
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-lg);
  }

  .hero-detail-value {
    font-size: var(--font-size-small);
  }

  .hourly-list {
    gap: var(--space-md);
  }

  .hourly-item {
    min-width: 50px;
  }

  .empty-state {
    margin-top: var(--space-xl);
    padding: 0 var(--space-md);
  }

  .empty-state__icon {
    font-size: 3rem;
  }

  .empty-state__title {
    font-size: var(--font-size-h2);
  }
}

/* ═══════════════════════════════════════════════
   RESPONSIVE — Small phone (≤480px)
   ═══════════════════════════════════════════════ */
@media (max-width: 480px) {
  .dashboard-layout {
    --mobile-header-offset: 136px;
  }

  .main-content {
    padding-top: calc(var(--mobile-header-offset) + env(safe-area-inset-top) + var(--space-sm));
  }

  .current-temp {
    font-size: 3rem;
  }

  .city-name {
    font-size: 1.4rem;
  }

  .widget--hero {
    padding: var(--space-lg) var(--space-md);
  }

  .widget--hero__main {
    padding-top: 34px;
  }

  .widget--hourly,
  .widget--forecast {
    padding: var(--space-md);
  }

  .widget__title {
    margin-bottom: var(--space-md);
  }

  .hero-details {
    flex-wrap: wrap;
    justify-content: center;
    border-radius: var(--radius-md);
  }

  .sidebar__title {
    font-size: var(--font-size-body);
  }

  .sidebar__brand {
    gap: var(--space-sm);
  }
}
</style>
