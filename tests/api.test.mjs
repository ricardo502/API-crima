import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePlaces, parseOpenMeteo, forecastParams } from '../api.mjs';
test('Adapta búsqueda directa, resultados vacíos y errores', () => {
  assert.deepEqual(parsePlaces({ results: [{ name:'Toluca', admin1:'Estado de México', country:'México', latitude:19.29, longitude:-99.65 }] }), [{name:'Toluca',description:'Estado de México, México',lat:19.29,lon:-99.65}]);
  assert.deepEqual(parsePlaces({generationtime_ms:0.1}), []);
  assert.throws(() => parsePlaces({results:'invalid'}));
  assert.throws(() => parsePlaces({error:true, reason:'bad'}));
});
test('Adapta clima WMO y fecha del dato sin simulación', () => {
  const current = {temperature_2m:12.9, relative_humidity_2m:66, surface_pressure:757.8, weather_code:3, time:1792251900};
  const weather = parseOpenMeteo({current});
  assert.equal(weather.condition,'Nublado');
  assert.equal(weather.temperature,12.9);
  assert.equal(weather.time,'2026-10-17T15:45:00.000Z');
  assert.throws(() => parseOpenMeteo({current:{...current,temperature_2m:null}}));
  assert.equal(forecastParams({lat:19,lon:-99}).latitude,19);
});
