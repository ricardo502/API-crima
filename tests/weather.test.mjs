import test from 'node:test';
import assert from 'node:assert/strict';
import { findDemoPlace, demoWeather, validatePlace, validateWeather } from '../weather.mjs';

test('Reconoce ciudades con acentos, mayúsculas y alias', () => {
  assert.equal(findDemoPlace('  CIUDAD DE MEXICO ').name, 'Ciudad de México');
  assert.equal(findDemoPlace('cdmx').name, 'Ciudad de México');
  assert.equal(findDemoPlace('desconocida'), undefined);
});
test('Lerma conserva los valores de la práctica y la simulación es estable', () => {
  const lerma = demoWeather(findDemoPlace('lerma'));
  assert.equal(lerma.temperature, 27.4);
  assert.equal(lerma.humidity, 91);
  assert.deepEqual(demoWeather(findDemoPlace('Madrid')), demoWeather(findDemoPlace('Madrid')));
});
test('Rechaza coordenadas inválidas antes de construir mapas', () => {
  for (const value of [{name:'x',lat:91,lon:0}, {name:'x',lat:null,lon:0}, {name:'x',lat:1,lon:181}, {name:'x',lat:'',lon:0}]) assert.throws(() => validatePlace(value));
  assert.deepEqual(validatePlace({name:'Madrid',lat:'40.4',lon:'-3.7'}), {name:'Madrid',description:'',lat:40.4,lon:-3.7});
});
test('Rechaza clima incompleto o fuera de rango', () => {
  for (const value of [{temperature:20,humidity:101,pressure:1012,condition:'Sol'}, {temperature:NaN,humidity:10,pressure:1012,condition:'Sol'}, {}]) assert.throws(() => validateWeather(value));
  assert.equal(validateWeather(demoWeather(findDemoPlace('lerma'))).humidity, 91);
});
