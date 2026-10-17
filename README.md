# Atmósfera · API-crima

Mapa de OpenStreetMap, búsqueda mundial con Nominatim y condiciones actuales estimadas por Open-Meteo. Temperatura °C, humedad %, presión de superficie hPa y condición WMO. No se sustituyen los errores por datos simulados.

## Ejecutar

Node.js 20 o superior, sin dependencias:

```bash
npm start
```

Abre http://127.0.0.1:4173. Requiere Internet. El servidor sirve la web y `/api/places?q=ciudad`, `/api/weather?lat=19&lon=-99`. Las cuatro sugerencias usan coordenadas predefinidas para ahorrar consultas geográficas; su clima sí viene del proveedor.

```bash
npm run check
npm run build
```

## Producción

**Necesita alojamiento con Node. GitHub Pages por sí solo no ejecuta las APIs.**

En Render u otro servicio Node conecta este repositorio; build `npm run check`, inicio `npm start`, variable `HOST=0.0.0.0`. El puerto se toma de `PORT`. Se incluye `render.yaml` para un Blueprint de Render. No se ha activado hosting; el despliegue queda a cargo del propietario.

Usa **una sola instancia/proceso**: la caché y el límite global de Nominatim se comparten en ese proceso. Para escalar necesitas un limitador y caché compartidos o cambiar de proveedor. Las cachés viven en memoria, admiten 500 entradas por servicio y se pierden al reiniciar.

`npm run build` genera solo frontend en `dist/`. Publicar esa carpeta sin el servidor no habilita las APIs. Si separas frontend/backend debes adaptar `config.js` y configurar CORS en el backend.

## Proveedores

- **OpenStreetMap:** mapa embebido con atribución visible.
- **Nominatim:** búsquedas manuales sin autocompletado, caché de 24 horas y solicitudes identificadas por User-Agent. El servidor permite una solicitud cada 1.1 segundos, sin concurrencia; devuelve 429 para reintentar cuando está ocupado. Revisa su [política de uso](https://operations.osmfoundation.org/policies/nominatim/): máximo una solicitud por segundo para toda la aplicación, sin búsquedas masivas. No envíes datos personales confidenciales. `NOMINATIM_URL` permite cambiar de servicio compatible mediante variable del servidor.
- **Open-Meteo:** [Forecast API](https://open-meteo.com/en/docs), condiciones actuales basadas en modelos y caché de cinco minutos. Muestra la fecha del dato del proveedor. La API pública no requiere clave para uso no comercial sujeto a sus [términos](https://open-meteo.com/en/terms). Para uso comercial o mayor volumen revisa el plan correspondiente. Atribución y licencia CC BY 4.0 visibles en la web.
- **OpenWeatherMap:** alternativa pendiente, no activada porque requiere una API key. La aplicación funciona con Open-Meteo sin esa clave. Para cambiar de proveedor hay que adaptar su respuesta y guardar la clave en variables de entorno del servidor.

No subas claves privadas a GitHub ni a `config.js`.

## Archivos

- `index.html`, `style.css`: interfaz.
- `app.js`, `config.js`: interacción y endpoints públicos.
- `weather.mjs`: lugares sugeridos, validación y utilidades de demostración heredadas (inactivas con la configuración actual).
- `scripts/providers.mjs`: integraciones, caché y limitador.
- `scripts/serve.mjs`: servidor y rutas API; solo sirve archivos de frontend permitidos.
- `tests/`: validadores e integraciones con respuestas controladas.

Cartografía © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Meteorología: [Open-Meteo](https://open-meteo.com/). Fuentes Google Fonts con alternativa de sistema.
