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
  const geoMessage = ref(""); // mensaje de feedback de geolocalización
  let favoritesMessageTimer = null;

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

  function setFavoritesMessage(message) {
    favoritesMessage.value = message;
    if (favoritesMessageTimer) clearTimeout(favoritesMessageTimer);
    favoritesMessageTimer = setTimeout(() => {
      favoritesMessage.value = "";
      favoritesMessageTimer = null;
    }, 2200);
  }

  function addFavorite(city) {
    if (favorites.value.length >= MAX_FAVORITES) {
      setFavoritesMessage(`Límite alcanzado: máximo ${MAX_FAVORITES} favoritas.`);
      return;
    }

    if (favorites.value.some(f => f.id === city.id)) {
      setFavoritesMessage("Esta ciudad ya está en favoritos.");
      return;
    }

    favorites.value.push({ ...city });
    saveFavorites();
    fetchWeatherForFavs();
    setFavoritesMessage("Agregado a favoritos.");
  }

  function removeFavorite(cityId) {
    const before = favorites.value.length;
    favorites.value = favorites.value.filter(f => f.id !== cityId);
    saveFavorites();
    if (favorites.value.length < before) {
      setFavoritesMessage("Eliminado de favoritos.");
    }
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

  function getCurrentPosition(options) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  async function geolocateCity() {
    geoMessage.value = "";

    if (!navigator.geolocation) {
      geoMessage.value = "Tu navegador no soporta geolocalización. Se cargó New York como alternativa.";
      await selectCity(DEFAULT_CITIES[3]);
      return;
    }

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalhost) {
      geoMessage.value = "En Android la ubicación requiere HTTPS. Abrí la app con https:// y revisá permisos del navegador.";
      await selectCity(DEFAULT_CITIES[3]);
      return;
    }

    if (navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "denied") {
          geoMessage.value = "Permiso de ubicación bloqueado en el navegador. Habilítalo en ajustes del sitio.";
          await selectCity(DEFAULT_CITIES[3]);
          return;
        }
      } catch {
        // Algunos navegadores móviles no implementan Permissions API de forma completa.
      }
    }

    statusGeo.value = "loading";

    try {
      let position;
      try {
        // Primer intento: precisión alta (ideal para GPS habilitado)
        position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
      } catch (err) {
        // Fallback Android común: precisión baja + caché reciente para evitar timeout
        if (err?.code === 3 || err?.code === 2) {
          position = await getCurrentPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 });
        } else {
          throw err;
        }
      }

      const { latitude: lat, longitude: lon } = position.coords;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`,
        { headers: { "Accept-Language": "es" } }
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
    } catch (err) {
      statusGeo.value = "idle";
      if (err?.code === 1) {
        geoMessage.value = "Permiso de ubicación denegado. En Android: navegador > Configuración del sitio > Ubicación. Se cargó New York.";
      } else if (err?.code === 3) {
        geoMessage.value = "Tiempo agotado al obtener ubicación. Verificá GPS/red y volvé a intentar. Se cargó New York.";
      } else {
        geoMessage.value = "No se pudo obtener tu ubicación. Revisá permisos y conexión. Se cargó New York.";
      }
      await selectCity(DEFAULT_CITIES[3]);
    }
  }

  function clearAll() {
    cities.value = [];
    forecast.value = null;
    selectedCity.value = null;
    statusCities.value = "idle";
    statusWeather.value = "idle";
    favoritesMessage.value = "";
    if (favoritesMessageTimer) {
      clearTimeout(favoritesMessageTimer);
      favoritesMessageTimer = null;
    }
  }

  return {
    cities, statusCities, errorCities, forecast, statusWeather, errorWeather,
    selectedCity, favorites, favoritesWeather, defaultCitiesWeather, favoritesMessage,
    statusGeo, geoMessage,
    hasForecast, hasCities, isFavoriteFull,
    searchCitiesAction, selectCity, fetchWeather, addFavorite, removeFavorite, isFavorite, loadFavorites, loadLastCity, clearAll, geolocateCity
  };
});
