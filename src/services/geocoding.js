/**
 * Servicio de Geocoding (Open-Meteo)
 *
 * Busca ciudades por nombre. Retorna JSON crudo de la API.
 * La normalización se hace en utils/transform.js para que
 * el componente nunca parsee JSON directo.
 *
 * API: https://geocoding-api.open-meteo.com/v1/search
 * Sin API key necesaria.
 */

const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

/**
 * Busca ciudades por nombre parcial.
 * @param {string} query — nombre de la ciudad a buscar
 * @returns {Promise<Object>} respuesta cruda de la API
 */
export async function searchCities(query) {
  const url = `${BASE_URL}?name=${encodeURIComponent(query)}&count=5&language=es&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error buscando ciudades: ${response.status}`);
  }

  return response.json();
}
