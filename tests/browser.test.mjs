import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const script = await readFile(new URL('../browser.js', import.meta.url), 'utf8');
const config = await readFile(new URL('../config.js', import.meta.url), 'utf8');
for (const href of ['file:///C:/proyecto/index.html?city=Toluca', 'https://ricardo502.github.io/API-crima/?city=Toluca']) {
  test(`Carga y busca sin recargar en ${new URL(href).protocol}`, async () => {
    const nodes = new Map();
    function node(id) {
      if (!nodes.has(id)) nodes.set(id, {textContent:'',value:'',style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(type,fn){this[type]=fn;}});
      return nodes.get(id);
    }
    const requests = [];
    const context = vm.createContext({
      window: {location:new URL(href)},
      document: {getElementById:node,querySelector:node,querySelectorAll:()=>[]},
      URL, URLSearchParams, AbortController, setTimeout, clearTimeout,
      fetch: async url => {
        requests.push(String(url));
        return {ok:true,json:async()=> String(url).includes('geocoding')
          ? {results:[{name:'Toluca',latitude:19.29,longitude:-99.65,admin1:'Estado de México',country:'México'}]}
          : {current:{temperature_2m:18.5,relative_humidity_2m:60,surface_pressure:760,weather_code:3,time:1792251900}}};
      },
    });
    vm.runInContext(config, context);
    vm.runInContext(script, context);
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(node('place-name').textContent,'Toluca');
    assert.equal(node('temperature').textContent,'18.5');
    assert.ok(node('map').src.includes('marker=19.29,-99.65'));
    node('city-input').value='Madrid';
    let prevented=false;
    node('search-form').submit({preventDefault(){prevented=true;}});
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(prevented,true);
    assert.equal(node('place-name').textContent,'Madrid');
    assert.ok(node('map').src.includes('marker=40.4168,-3.7038'));
    assert.ok(requests.every(url=>url.startsWith('https://')));
    assert.equal(node('search-btn').disabled,false);
  });
}
