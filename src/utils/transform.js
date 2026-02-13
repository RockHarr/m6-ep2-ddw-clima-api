/**
 * Transform — Capa de normalización de datos
 *
 * ¿Por qué existe este archivo?
 * Los componentes de UI NUNCA deben parsear JSON crudo de APIs.
 * Si la API cambia su formato, solo tocamos este archivo.
 * Los componentes reciben datos ya listos para renderizar.
 */

/**
 * Mapeo de WMO Weather Codes a etiquetas + emojis en español.
 * Ref: https://open-meteo.com/en/docs#weathervariables
 */
const WMO_CODES = {
  0: { label: "Despejado", icon: "☀️" },
  1: { label: "Mayormente despejado", icon: "🌤️" },
  2: { label: "Parcialmente nublado", icon: "⛅" },
  3: { label: "Nublado", icon: "☁️" },
  45: { label: "Niebla", icon: "🌫️" },
  48: { label: "Niebla con escarcha", icon: "🌫️" },
  51: { label: "Llovizna ligera", icon: "🌦️" },
  53: { label: "Llovizna moderada", icon: "🌦️" },
  55: { label: "Llovizna intensa", icon: "🌦️" },
  61: { label: "Lluvia ligera", icon: "🌧️" },
  63: { label: "Lluvia moderada", icon: "🌧️" },
  65: { label: "Lluvia intensa", icon: "🌧️" },
  71: { label: "Nieve ligera", icon: "❄️" },
  73: { label: "Nieve moderada", icon: "❄️" },
  75: { label: "Nieve intensa", icon: "❄️" },
  77: { label: "Granizo", icon: "🌨️" },
  80: { label: "Chubascos ligeros", icon: "🌧️" },
  81: { label: "Chubascos moderados", icon: "🌧️" },
  82: { label: "Chubascos violentos", icon: "⛈️" },
  85: { label: "Nevada ligera", icon: "🌨️" },
  86: { label: "Nevada intensa", icon: "🌨️" },
  95: { label: "Tormenta eléctrica", icon: "🌩️" },
  96: { label: "Tormenta con granizo", icon: "⛈️" },
  99: { label: "Tormenta con granizo fuerte", icon: "⛈️" },
};

/**
 * Convierte un WMO weather code a label + emoji.
 * Si el código no existe, retorna un fallback genérico.
 */
export function wmoCodeToLabel(code) {
  return WMO_CODES[code] || { label: "Desconocido", icon: "🌡️" };
}

/**
 * Devuelve ícono horario considerando si es día o noche.
 * Mantiene la misma etiqueta, pero ajusta el emoji para casos nocturnos.
 */
function hourlyIconForCode(code, isDay) {
  if (!isDay) {
    if (code === 0) return "🌙";
    if (code === 1 || code === 2) return "🌙☁️";
  }
  return wmoCodeToLabel(code).icon;
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) en español legible.
 * Ejemplo: "2026-02-11" → "Martes 11 Feb"
 * Usa Intl.DateTimeFormat nativo, sin dependencias externas.
 */
export function formatDate(isoDate) {
  const date = new Date(isoDate + "T12:00:00"); // Mediodía para evitar problemas de timezone
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "short",
  })
    .format(date)
    .replace(/^\w/, (c) => c.toUpperCase()); // Capitalizar primera letra
}

/**
 * Normaliza la respuesta de geocoding a un formato limpio.
 * Extrae solo los campos que la UI necesita.
 */
export function normalizeCities(raw) {
  if (!raw || !raw.results) return [];

  return raw.results.map((city) => ({
    id: city.id,
    name: city.name,
    country: city.country || "",
    admin: city.admin1 || "",
    lat: city.latitude,
    lon: city.longitude,
  }));
}

/**
 * Normaliza la respuesta de forecast a un objeto estructurado.
 * Incluye daily (7 días) y hourly (próximas 24 horas).
 */
export function normalizeForecast(raw) {
  if (!raw || !raw.daily) return null;

  const { daily, hourly, timezone, timezone_abbreviation, current_weather } = raw;
  const now = new Date();
  const indexByCurrentWeatherTime = current_weather?.time
    ? hourly.time.findIndex((t) => t === current_weather.time)
    : -1;
  const fallbackIndex = hourly.time.findIndex((t) => new Date(t) >= now);
  const currentHourIndex = indexByCurrentWeatherTime >= 0 ? indexByCurrentWeatherTime : Math.max(0, fallbackIndex);

  // Próximas 24 horas a partir de ahora
  const hourlyData = hourly.time.slice(currentHourIndex, currentHourIndex + 24).map((time, i) => {
    const idx = currentHourIndex + i;
    const code = hourly.weather_code[idx];
    const isDay = hourly.is_day?.[idx] === 1;
    return {
      time: time.split("T")[1], // Solo la hora HH:mm
      temp: Math.round(hourly.temperature_2m[idx]),
      icon: hourlyIconForCode(code, isDay),
    };
  });

  const dailyData = daily.time.map((date, i) => {
    const weatherInfo = wmoCodeToLabel(daily.weather_code[i]);

    return {
      date,
      dateFormatted: formatDate(date),
      min: Math.round(daily.temperature_2m_min[i]),
      max: Math.round(daily.temperature_2m_max[i]),
      weatherLabel: weatherInfo.label,
      weatherIcon: weatherInfo.icon,
      windSpeed: Math.round(daily.wind_speed_10m_max[i]),
      uvIndex: Math.round(daily.uv_index_max[i]),
    };
  });

  return {
    daily: dailyData,
    hourly: hourlyData,
    timezone,
    timezoneAbbr: timezone_abbreviation
  };
}
