export const PLACES = [
  { name: 'Lerma', description: 'Estado de México, México', lat: 19.2866, lon: -99.5115 },
  { name: 'Monterrey', description: 'Nuevo León, México', lat: 25.6866, lon: -100.3161 },
  { name: 'Madrid', description: 'Comunidad de Madrid, España', lat: 40.4168, lon: -3.7038 },
  { name: 'Ciudad de México', description: 'Ciudad de México, México', lat: 19.4326, lon: -99.1332 },
];
export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function findDemoPlace(query) {
  const name = normalize(query);
  return PLACES.find(place => normalize(place.name) === name || (name === 'cdmx' && place.name === 'Ciudad de México'));
}
export function validatePlace(value) {
  const lat = Number(value?.lat), lon = Number(value?.lon);
  if (!value || typeof value.name !== 'string' || !value.name.trim() || value.lat == null || value.lon == null || value.lat === '' || value.lon === '' || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error('La API devolvió una ubicación inválida.');
  return { name: value.name, description: String(value.description || ''), lat, lon };
}
export function validateWeather(value) {
  if (!value || !['temperature', 'humidity', 'pressure'].every(key => typeof value[key] === 'number' && Number.isFinite(value[key])) || value.humidity < 0 || value.humidity > 100 || value.pressure <= 0 || typeof value.condition !== 'string' || !value.condition.trim()) throw new Error('La API devolvió datos meteorológicos inválidos.');
  return value;
}
export function demoWeather(place) {
  if (normalize(place.name) === 'lerma') return { temperature: 27.4, humidity: 91, pressure: 1012, condition: 'Tormenta meteorológica' };
  const seed = Math.abs(Math.round(place.lat * 100 + place.lon * 10));
  return { temperature: Number((16 + seed % 160 / 10).toFixed(1)), humidity: 40 + seed % 51, pressure: 1005 + seed % 18, condition: ['Despejado', 'Parcialmente nublado', 'Lluvia ligera'][seed % 3] };
}
