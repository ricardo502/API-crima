import { validatePlace, validateWeather } from './weather.mjs';

export function parsePlaces(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.error || (data.results !== undefined && !Array.isArray(data.results))) throw new Error('La API geográfica devolvió una respuesta inválida.');
  return (data.results || []).map(place => validatePlace({
    name: place.name,
    description: [...new Set([place.admin1, place.country].filter(Boolean))].join(', '),
    lat: place.latitude, lon: place.longitude,
  }));
}

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

export function forecastParams(place) {
  return {
    latitude: place.lat, longitude: place.lon,
    current: 'temperature_2m,relative_humidity_2m,surface_pressure,weather_code',
    timeformat: 'unixtime', temperature_unit: 'celsius', forecast_days: '1',
  };
}
