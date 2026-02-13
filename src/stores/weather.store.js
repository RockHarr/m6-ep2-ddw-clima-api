/**
 * Weather Store (Pinia)
 * Maneja todo el estado relacionado al clima, búsqueda y favoritos.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { searchCities as apiSearchCities } from "@/services/geocoding.js";
import { fetchForecast as apiFetchForecast } from "@/services/weather.js";
import { normalizeCities, normalizeForecast } from "@/utils/transform.js";

const LAST_CITY_KEY = "clima_last_city";
const FAVORITES_KEY = "clima_favorites";
const MAX_FAVORITES = 6;
const DEFAULT_CITIES = [
  { id: 1, name: "Santiago", admin: "Región Metropolitana", country: "Chile", lat: -33.4569, lon: -70.6483 },
  { id: 2, name: "Madrid", admin: "Comunidad de Madrid", country: "España", lat: 40.4165, lon: -3.7026 },
  { id: 3, name: "Tokyo", admin: "Tokyo", country: "Japón", lat: 35.6895, lon: 139.6917 },
  { id: 4, name: "New York", admin: "New York", country: "EE.UU.", lat: 40.7128, lon: -74.0060 }
];

export const useWeatherStore = defineStore("weather", () => {
  // --- Estado ---
  const cities = ref([]);
  const statusCities = ref("idle");
  const errorCities = ref("");
  const forecast = ref(null);
  const statusWeather = ref("idle");
  const errorWeather = ref("");
  const selectedCity = ref(null);
  const favorites = ref([]);
  const favoritesMessage = ref("");
  const favoritesWeather = ref({});
  const defaultCitiesWeather = ref({});
  const statusGeo = ref("idle"); // idle | loading | error

  // --- Computed ---
  const hasForecast = computed(() => forecast.value?.daily?.length > 0);
  const hasCities = computed(() => cities.value.length > 0);
  const isFavoriteFull = computed(() => favorites.value.length >= MAX_FAVORITES);

  // --- Helpers ---
  async function fetchWeatherForList(list, targetRef) {
    for (const city of list) {
      if (!targetRef.value[city.id]) {
        try {
          const raw = await apiFetchForecast(city.lat, city.lon);
          targetRef.value[city.id] = normalizeForecast(raw);
        } catch (err) {
          console.error(`Error fetching weather for ${city.name}`, err);
        }
      }
    }
  }

  // --- Actions ---
  async function searchCitiesAction(query) {
    if (!query || !query.trim()) {
      cities.value = DEFAULT_CITIES;
      statusCities.value = "success";
      fetchWeatherForList(DEFAULT_CITIES, defaultCitiesWeather);
      return;
    }

    statusCities.value = "loading";
    errorCities.value = "";
    try {
      const raw = await apiSearchCities(query);
      cities.value = normalizeCities(raw);
      statusCities.value = cities.value.length > 0 ? "success" : "empty";
    } catch (err) {
      errorCities.value = "Error al buscar ciudades.";
      statusCities.value = "error";
    }
  }

  async function selectCity(city) {
    selectedCity.value = city;
    cities.value = [];
    statusCities.value = "idle";
    localStorage.setItem(LAST_CITY_KEY, JSON.stringify(city));
    await fetchWeather();
  }

  async function fetchWeather() {
    if (!selectedCity.value) return;
    statusWeather.value = "loading";
    errorWeather.value = "";
    try {
      const raw = await apiFetchForecast(selectedCity.value.lat, selectedCity.value.lon);
      forecast.value = normalizeForecast(raw);
      statusWeather.value = "success";
    } catch (err) {
      errorWeather.value = "Error al cargar el clima.";
      statusWeather.value = "error";
    }
  }

  async function fetchWeatherForFavs() {
    await fetchWeatherForList(favorites.value, favoritesWeather);
  }

  function addFavorite(city) {
    if (favorites.value.length >= MAX_FAVORITES || favorites.value.some(f => f.id === city.id)) return;
    favorites.value.push({ ...city });
    saveFavorites();
    fetchWeatherForFavs();
  }

  function removeFavorite(cityId) {
    favorites.value = favorites.value.filter(f => f.id !== cityId);
    saveFavorites();
  }

  function isFavorite(cityId) {
    return favorites.value.some(f => f.id === cityId);
  }

  function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value));
  }

  async function loadFavorites() {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      favorites.value = JSON.parse(stored);
      await fetchWeatherForFavs();
    }
  }

  async function loadLastCity() {
    const stored = localStorage.getItem(LAST_CITY_KEY);
    if (stored) await selectCity(JSON.parse(stored));
  }

  async function geolocateCity() {
    if (!navigator.geolocation) {
      await selectCity(DEFAULT_CITIES[3]); // fallback New York
      return;
    }

    statusGeo.value = "loading";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`,
            { headers: { 'Accept-Language': 'es' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = {
            id: `geo-${lat.toFixed(3)}-${lon.toFixed(3)}`,
            name: addr.city || addr.town || addr.village || addr.municipality || "Mi Ubicación",
            admin: addr.state || addr.region || "",
            country: addr.country || "",
            lat,
            lon,
          };
          statusGeo.value = "idle";
          await selectCity(city);
        } catch {
          statusGeo.value = "idle";
          await selectCity(DEFAULT_CITIES[3]); // fallback New York
        }
      },
      async () => {
        statusGeo.value = "idle";
        await selectCity(DEFAULT_CITIES[3]); // denegado → New York
      },
      { timeout: 8000 }
    );
  }

  function clearAll() {
    cities.value = [];
    forecast.value = null;
    selectedCity.value = null;
    statusCities.value = "idle";
    statusWeather.value = "idle";
    favoritesMessage.value = "";
  }

  return {
    cities, statusCities, errorCities, forecast, statusWeather, errorWeather,
    selectedCity, favorites, favoritesWeather, defaultCitiesWeather, favoritesMessage,
    statusGeo,
    hasForecast, hasCities, isFavoriteFull,
    searchCitiesAction, selectCity, fetchWeather, addFavorite, removeFavorite, isFavorite, loadFavorites, loadLastCity, clearAll, geolocateCity
  };
});
