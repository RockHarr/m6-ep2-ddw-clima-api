/**
 * Weather Store (Pinia)
 *
 * Maneja todo el estado relacionado al clima:
 * - Búsqueda de ciudades (statusCities)
 * - Pronóstico del clima (statusWeather)
 * - Ciudad seleccionada, última ciudad, favoritos
 *
 * ¿Por qué statusCities y statusWeather separados?
 * Porque son flujos async independientes. Puede estar
 * cargando ciudades mientras el clima ya se muestra, o viceversa.
 * Si usáramos un solo status, un loading de ciudades
 * borraría las cards de clima que ya están visibles.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { searchCities as apiSearchCities } from "@/services/geocoding.js";
import { fetchForecast as apiFetchForecast } from "@/services/weather.js";
import { normalizeCities, normalizeForecast } from "@/utils/transform.js";

// Claves de localStorage para persistencia de bonus features
const LAST_CITY_KEY = "clima_last_city";
const FAVORITES_KEY = "clima_favorites";
const MAX_FAVORITES = 6;

export const useWeatherStore = defineStore("weather", () => {
  // --- Estado de búsqueda de ciudades ---
  const cities = ref([]);
  const statusCities = ref("idle"); // idle | loading | success | error
  const errorCities = ref("");

  // --- Estado del pronóstico ---
  const forecast = ref([]);
  const statusWeather = ref("idle"); // idle | loading | success | error
  const errorWeather = ref("");

  // --- Ciudad seleccionada ---
  const selectedCity = ref(null);

  // --- Bonus: favoritos ---
  const favorites = ref([]);
  const favoritesMessage = ref("");

  // --- Computed ---
  const hasForecast = computed(() => forecast.value.length > 0);
  const hasCities = computed(() => cities.value.length > 0);
  const isFavoriteFull = computed(
    () => favorites.value.length >= MAX_FAVORITES,
  );

  /**
   * Busca ciudades por nombre usando la API de geocoding.
   * Actualiza statusCities para que la UI reaccione.
   */
  async function searchCitiesAction(query) {
    statusCities.value = "loading";
    errorCities.value = "";
    cities.value = [];

    try {
      const raw = await apiSearchCities(query);
      cities.value = normalizeCities(raw);
      statusCities.value = cities.value.length > 0 ? "success" : "empty";
    } catch (err) {
      errorCities.value = "Error al buscar ciudades. Verifica tu conexión.";
      statusCities.value = "error";
    }
  }

  /**
   * Selecciona una ciudad y dispara la carga del clima.
   * También guarda como última ciudad en localStorage.
   */
  async function selectCity(city) {
    selectedCity.value = city;
    cities.value = []; // Cerrar dropdown
    statusCities.value = "idle";

    // Guardar como última ciudad visitada (Bonus 1)
    localStorage.setItem(LAST_CITY_KEY, JSON.stringify(city));

    await fetchWeather();
  }

  /**
   * Obtiene el pronóstico para la ciudad seleccionada.
   */
  async function fetchWeather() {
    if (!selectedCity.value) return;

    statusWeather.value = "loading";
    errorWeather.value = "";

    try {
      const raw = await apiFetchForecast(
        selectedCity.value.lat,
        selectedCity.value.lon,
      );
      forecast.value = normalizeForecast(raw);
      statusWeather.value = "success";
    } catch (err) {
      errorWeather.value = "Error al cargar el clima. Verifica tu conexión.";
      statusWeather.value = "error";
    }
  }

  /**
   * Agrega una ciudad a favoritos (máximo 6).
   * Se guarda en localStorage para persistir entre sesiones.
   */
  function addFavorite(city) {
    favoritesMessage.value = "";

    if (favorites.value.length >= MAX_FAVORITES) {
      favoritesMessage.value = `Máximo ${MAX_FAVORITES} favoritos alcanzado`;
      return;
    }

    // Evitar duplicados por id
    if (favorites.value.some((f) => f.id === city.id)) {
      favoritesMessage.value = "Esta ciudad ya está en favoritos";
      return;
    }

    favorites.value.push({ ...city });
    saveFavorites();
  }

  /**
   * Elimina una ciudad de favoritos por id.
   */
  function removeFavorite(cityId) {
    favoritesMessage.value = "";
    favorites.value = favorites.value.filter((f) => f.id !== cityId);
    saveFavorites();
  }

  /**
   * Verifica si una ciudad está en favoritos.
   */
  function isFavorite(cityId) {
    return favorites.value.some((f) => f.id === cityId);
  }

  /**
   * Persiste favoritos en localStorage.
   */
  function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value));
  }

  /**
   * Carga favoritos desde localStorage al montar el dashboard.
   */
  function loadFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        favorites.value = JSON.parse(stored);
      }
    } catch {
      favorites.value = [];
    }
  }

  /**
   * Carga la última ciudad visitada y auto-carga el clima.
   * Se ejecuta al montar el dashboard (Bonus 1).
   */
  async function loadLastCity() {
    try {
      const stored = localStorage.getItem(LAST_CITY_KEY);
      if (stored) {
        const city = JSON.parse(stored);
        await selectCity(city);
      }
    } catch {
      // Si hay datos corruptos, simplemente ignorar
    }
  }

  /**
   * Limpia todo el estado de clima (se llama al hacer logout).
   */
  function clearAll() {
    cities.value = [];
    forecast.value = [];
    selectedCity.value = null;
    statusCities.value = "idle";
    statusWeather.value = "idle";
    errorCities.value = "";
    errorWeather.value = "";
    favoritesMessage.value = "";
  }

  return {
    // State
    cities,
    statusCities,
    errorCities,
    forecast,
    statusWeather,
    errorWeather,
    selectedCity,
    favorites,
    favoritesMessage,
    // Computed
    hasForecast,
    hasCities,
    isFavoriteFull,
    // Actions
    searchCitiesAction,
    selectCity,
    fetchWeather,
    addFavorite,
    removeFavorite,
    isFavorite,
    loadFavorites,
    loadLastCity,
    clearAll,
  };
});
