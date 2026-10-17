import { normalize, validatePlace, validateWeather } from '../weather.mjs';

export function weatherDescription(code) {
  if (code === 0) return 'Despejado';
  if ([1, 2].includes(code)) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if ([45, 48].includes(code)) return 'Niebla';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Llovizna';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Lluvia';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Nieve';
  if ([80, 81, 82].includes(code)) return 'Chubascos';
  if ([95, 96, 99].includes(code)) return 'Tormenta eléctrica';
  return 'Condición no clasificada';
}

export function parseOpenMeteo(data) {
  const current = data?.current;
  const weather = validateWeather({
    temperature: current?.temperature_2m,
    humidity: current?.relative_humidity_2m,
    pressure: current?.surface_pressure,
    condition: weatherDescription(current?.weather_code),
  });
  if (!Number.isInteger(current?.weather_code) || !Number.isFinite(current?.time)) throw new Error('Respuesta meteorológica incompleta.');
  return { ...weather, source: 'Open-Meteo', time: new Date(current.time * 1000).toISOString() };
}

export function createProviders({ fetcher = fetch, now = Date.now, env = process.env } = {}) {
  const places = new Map(), weather = new Map();
  let geocodingBusy = false, nextGeocoding = 0;
  const failure = (message, status = 502) => Object.assign(new Error(message), { status });
  async function request(url) {
    let response;
    try {
      response = await fetcher(url, {
        signal: AbortSignal.timeout(9000),
        headers: { Accept: 'application/json', 'User-Agent': 'Atmosfera-API-crima/1.0 (+https://github.com/ricardo502/API-crima)' },
      });
    } catch { throw failure('El proveedor no responde. Intenta de nuevo.'); }
    if (!response.ok) throw failure(response.status === 429 ? 'El proveedor está ocupado. Intenta más tarde.' : 'No fue posible consultar el proveedor.', response.status === 429 ? 429 : 502);
    return response.json();
  }
  function cached(map, key) {
    const item = map.get(key);
    if (item && item.expires > now()) return item.data;
    map.delete(key);
  }
  function store(map, key, data, ttl) {
    if (map.size >= 500) map.delete(map.keys().next().value);
    map.set(key, { data, expires: now() + ttl });
    return data;
  }
  return {
    async geocode(query) {
      if (typeof query !== 'string' || !query.trim() || query.trim().length > 160) throw failure('Escribe una ciudad válida (máximo 160 caracteres).', 400);
      const key = normalize(query);
      const hit = cached(places, key);
      if (hit) return hit;
      if (geocodingBusy || now() < nextGeocoding) throw failure('Espera un segundo antes de buscar otro lugar.', 429);
      geocodingBusy = true;
      nextGeocoding = now() + 1100;
      try {
        const url = new URL(env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org/search');
        url.search = new URLSearchParams({ q: query.trim(), format: 'jsonv2', limit: '1', 'accept-language': 'es' });
        const data = await request(url);
        if (!Array.isArray(data)) throw failure('Respuesta geográfica inválida.');
        const result = data.map(place => validatePlace({ name: place.name || place.display_name?.split(',')[0], description: place.display_name, lat: place.lat, lon: place.lon }));
        return store(places, key, result, 86400000);
      } finally { geocodingBusy = false; }
    },
    async forecast(lat, lon) {
      let place;
      try { place = validatePlace({ name: 'Consulta', lat, lon }); }
      catch { throw failure('Las coordenadas no son válidas.', 400); }
      const key = `${place.lat.toFixed(4)},${place.lon.toFixed(4)}`;
      const hit = cached(weather, key);
      if (hit) return hit;
      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.search = new URLSearchParams({ latitude: place.lat, longitude: place.lon, current: 'temperature_2m,relative_humidity_2m,surface_pressure,weather_code', timeformat: 'unixtime', temperature_unit: 'celsius', forecast_days: '1' });
      return store(weather, key, parseOpenMeteo(await request(url)), 300000);
    },
  };
}
