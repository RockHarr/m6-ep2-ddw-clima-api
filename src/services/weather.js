/**
 * Servicio de Forecast (Open-Meteo)
 *
 * Obtiene pronóstico para 2 días: hoy y mañana.
 * Incluye datos extra (viento, UV) para highlights.
 * Retorna JSON crudo — la normalización va en transform.js.
 *
 * API: https://api.open-meteo.com/v1/forecast
 * Sin API key necesaria.
 */

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Obtiene el pronóstico de 2 días para una coordenada.
 * @param {number} lat — latitud
 * @param {number} lon — longitud
 * @returns {Promise<Object>} respuesta cruda de la API
 */
export async function fetchForecast(lat, lon) {
  // Pedimos temp min/max, weather_code, viento máximo y UV máximo.
  // En hourly incluimos is_day para iconografía coherente día/noche.
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily:
      "temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,uv_index_max",
    hourly: "temperature_2m,weather_code,is_day",
    current_weather: "true",
    timezone: "auto",
    forecast_days: "7",
  });

  const response = await fetch(`${BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Error obteniendo clima: ${response.status}`);
  }

  return response.json();
}
