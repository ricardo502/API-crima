import { PLACES, normalize, findDemoPlace, validatePlace, demoWeather } from './weather.mjs';
import { parsePlaces, parseOpenMeteo, forecastParams } from './api.mjs';

const $ = id => document.getElementById(id);
const config = window.APP_CONFIG || {};
let activePlace = PLACES[0];
let busy = false;
const cache = new Map();
const weatherCache = new Map();

async function getJSON(endpoint, params) {
  const url = new URL(endpoint, window.location.href);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('El endpoint configurado no es válido.');
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.reason || (typeof body.error === 'string' ? body.error : '') || (response.status === 429 ? 'Demasiadas consultas. Intenta de nuevo en un momento.' : 'No se pudo consultar el servicio. Intenta de nuevo.'));
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('El servicio tardó demasiado. Intenta de nuevo.');
    if (error instanceof TypeError) throw new Error('No hay conexión con el servicio. Revisa tu conexión e inténtalo de nuevo.');
    throw error;
  } finally { clearTimeout(timer); }
}

function renderPlace(place) {
  $('place-name').textContent = place.name;
  $('place-description').textContent = place.description;
  $('latitude').textContent = `${place.lat.toFixed(4)}°`;
  $('longitude').textContent = `${place.lon.toFixed(4)}°`;
  const lat = Math.max(-85, Math.min(85, place.lat));
  const west = Math.max(-180, place.lon - 0.075), east = Math.min(180, place.lon + 0.075);
  const bbox = [west, Math.max(-85, lat - 0.045), east, Math.min(85, lat + 0.045)].join(',');
  $('map').src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${place.lat},${place.lon}`;
  $('map-link').href = `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=13/${place.lat}/${place.lon}`;
  document.querySelectorAll('[data-city]').forEach(button => button.classList.toggle('selected', normalize(button.dataset.city) === normalize(place.name)));
}

function renderWeather(weather, real) {
  $('temperature').textContent = weather.temperature.toFixed(1);
  $('humidity').textContent = String(weather.humidity);
  $('pressure').textContent = String(weather.pressure);
  $('condition').textContent = weather.condition;
  $('humidity-bar').style.width = `${weather.humidity}%`;
  $('weather-symbol').textContent = /lluvia|tormenta/i.test(weather.condition) ? '☂' : /nublado/i.test(weather.condition) ? '☁' : '☀';
  $('data-source').textContent = real ? 'OPEN-METEO · MODELO ACTUAL' : 'DATOS SIMULADOS';
  $('result-status').textContent = real ? '● Datos meteorológicos recibidos' : '● Vista de demostración lista';
  $('updated').textContent = real ? `Datos: ${new Date(weather.time).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}` : 'Pendiente de API meteorológica';
}

function clearWeather() {
  for (const id of ['temperature', 'humidity', 'pressure']) $(id).textContent = '—';
  $('condition').textContent = 'Clima no disponible';
  $('humidity-bar').style.width = '0%';
  $('data-source').textContent = 'SIN DATOS';
  $('result-status').textContent = 'No se pudo obtener el clima';
  $('updated').textContent = 'Vuelve a consultar para reintentar';
}

async function search(query) {
  if (busy) return;
  query = query.trim();
  if (!query) { $('status').textContent = 'Escribe el nombre de una ciudad.'; $('city-input').focus(); return; }
  busy = true;
  $('search-btn').disabled = true;
  $('search-btn').textContent = 'Consultando…';
  $('weather-card').setAttribute('aria-busy', 'true');
  $('status').classList.remove('error');
  $('status').textContent = 'Buscando la ubicación…';
  try {
    const key = normalize(query);
    let place = cache.get(key) || findDemoPlace(query);
    if (!place && config.geocodingEndpoint) {
      const results = parsePlaces(await getJSON(config.geocodingEndpoint, { name: query, count: 1, language: 'es', format: 'json' }));
      if (!Array.isArray(results)) throw new Error('La API geográfica devolvió una respuesta inválida.');
      if (!results.length) throw new Error('No encontramos ese lugar. Prueba con ciudad y país.');
      place = validatePlace(results[0]);
      cache.set(key, place);
    }
    if (!place) throw new Error('En modo demo puedes explorar Lerma, Monterrey, Madrid y Ciudad de México. La búsqueda global estará disponible al conectar la API.');
    activePlace = place;
    renderPlace(activePlace);
    if (config.weatherEndpoint) {
      clearWeather();
      $('status').textContent = 'Ubicación encontrada. Consultando el clima…';
      const weatherKey = `${place.lat},${place.lon}`;
      let cachedWeather = weatherCache.get(weatherKey);
      if (!cachedWeather || cachedWeather.expires <= Date.now()) {
        cachedWeather = { value: parseOpenMeteo(await getJSON(config.weatherEndpoint, forecastParams(place))), expires: Date.now() + 300000 };
        if (weatherCache.size >= 100) weatherCache.delete(weatherCache.keys().next().value);
        weatherCache.set(weatherKey, cachedWeather);
      }
      renderWeather(cachedWeather.value, true);
    } else renderWeather(demoWeather(place), false);
    $('status').textContent = `Ubicación encontrada: ${place.name}.${config.weatherEndpoint ? '' : ' Clima de demostración.'}`;
  } catch (error) {
    $('status').textContent = error.message;
    $('status').classList.add('error');
  } finally {
    busy = false;
    $('search-btn').disabled = false;
    $('search-btn').innerHTML = 'Explorar ubicación <span aria-hidden="true">↗</span>';
    $('weather-card').setAttribute('aria-busy', 'false');
  }
}

$('search-form').addEventListener('submit', event => { event.preventDefault(); search($('city-input').value); });
document.querySelectorAll('[data-city]').forEach(button => button.addEventListener('click', () => {
  if (busy) return;
  $('city-input').value = button.dataset.city;
  search(button.dataset.city);
}));
renderPlace(activePlace);
if (config.weatherEndpoint) {
  document.querySelector('.live-tag').textContent = 'CLIMA ACTUAL';
  $('mode-note').textContent = 'Condiciones actuales y búsqueda de ciudades con Open-Meteo. Mapa de OpenStreetMap. Funciona directamente desde este sitio.';
  search(activePlace.name);
} else renderWeather(demoWeather(activePlace), false);
