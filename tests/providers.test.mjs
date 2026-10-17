import test from 'node:test';
import assert from 'node:assert/strict';
import { createProviders, parseOpenMeteo, weatherDescription } from '../scripts/providers.mjs';
const current = { temperature_2m: 18.2, relative_humidity_2m: 64, surface_pressure: 760, weather_code: 95, time: 1700000000 };
test('Adapta unidades, códigos WMO y hora del proveedor', () => {
  const result = parseOpenMeteo({ current });
  assert.equal(result.pressure, 760);
  assert.equal(result.condition, 'Tormenta eléctrica');
  assert.equal(result.time, '2023-11-14T22:13:20.000Z');
  assert.equal(weatherDescription(0), 'Despejado');
  assert.equal(weatherDescription(71), 'Nieve');
  assert.throws(() => parseOpenMeteo({current:{...current, temperature_2m:null}}));
});
test('Nominatim limita las consultas globales y cachea resultados', async () => {
  let time = 10000, count = 0;
  const api = createProviders({now: () => time, fetcher: async (url, options) => {
    count++;
    assert.equal(url.searchParams.get('format'), 'jsonv2');
    assert.ok(options.headers['User-Agent'].includes('API-crima'));
    return {ok:true, json:async () => [{name:'Puebla',display_name:'Puebla, México',lat:'19.04',lon:'-98.2'}]};
  }});
  assert.equal((await api.geocode('Puebla'))[0].lat, 19.04);
  await api.geocode('PUEBLA');
  assert.equal(count, 1);
  await assert.rejects(api.geocode('Toluca'), {status:429});
  time += 1100;
  await api.geocode('Toluca');
  assert.equal(count, 2);
});
test('Valida coordenadas, cachea clima y propaga fallos', async () => {
  let count = 0;
  const api = createProviders({fetcher: async url => {
    count++;
    assert.equal(url.searchParams.get('latitude'), '19');
    return {ok:true,json:async () => ({current})};
  }});
  await assert.rejects(api.forecast(null, null), {status:400});
  await assert.rejects(api.forecast('91', '0'), {status:400});
  await api.forecast('19', '-99');
  await api.forecast('19', '-99');
  assert.equal(count, 1);
  const broken = createProviders({fetcher: async () => ({ok:false,status:503})});
  await assert.rejects(broken.forecast(19,-99), {status:502});
});
