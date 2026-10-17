# Atmósfera · API-crima

Web estática lista para **GitHub Pages**: mapa interactivo de OpenStreetMap, búsqueda de ciudades y clima actual estimado por Open-Meteo.

## Publicar desde GitHub

1. Abre el repositorio en GitHub y entra a **Settings → Pages**.
2. En **Source** selecciona **Deploy from a branch**.
3. Selecciona la rama **main**, carpeta **/ (root)** y pulsa **Save**.
4. Espera a que GitHub termine de publicar y abre el enlace indicado en Pages.

Dirección esperada: **https://ricardo502.github.io/API-crima/**.

**No necesitas ejecutar npm, instalar dependencias, compilar ni contratar un servidor.** GitHub publica los archivos de la raíz. `.nojekyll` evita el procesamiento Jekyll. Todos los recursos locales usan rutas relativas compatibles con `/API-crima/`.

## Cómo funciona

El navegador consulta directamente las APIs públicas de Open-Meteo mediante HTTPS:

- Búsqueda: `https://geocoding-api.open-meteo.com/v1/search`.
- Meteorología: `https://api.open-meteo.com/v1/forecast`.
- Mapa: visor embebido de OpenStreetMap.

No hay rutas `/api` propias, backend, claves privadas ni datos meteorológicos simulados con la configuración actual. Las cuatro ciudades sugeridas usan coordenadas conocidas; el clima siempre viene del proveedor. Otras ciudades se buscan al enviar el formulario. Las búsquedas se cachean durante la sesión y el clima durante cinco minutos. Si falla una consulta de clima se muestra un error sin inventar valores.

La presión es de superficie (hPa), temperatura en °C y humedad en %. La fecha mostrada corresponde al dato del proveedor, convertido a la hora local del visitante. Open-Meteo proporciona condiciones actuales estimadas por modelos.

Se sustituyó Nominatim por la geocodificación de Open-Meteo para que el sitio funcione sin un servidor que controle el límite agregado de consultas de Nominatim. OpenWeatherMap no se usa porque requiere una clave; no se deben publicar claves privadas en un sitio estático.

Las APIs públicas de Open-Meteo están sujetas a sus [términos y límites](https://open-meteo.com/en/terms), con uso gratuito no comercial. Para uso comercial revisa sus planes. Documentación: [geocodificación](https://open-meteo.com/en/docs/geocoding-api) y [meteorología](https://open-meteo.com/en/docs).

## Archivos

- `index.html`, `style.css`: interfaz adaptable.
- `app.js`: búsquedas y estados de la interfaz.
- `api.mjs`: adaptación de respuestas públicas.
- `weather.mjs`: coordenadas y validadores (incluye utilidades de demostración heredadas, inactivas).
- `config.js`: URLs públicas, sin secretos.

`package.json`, `scripts/serve.mjs` y `tests/` son herramientas opcionales de desarrollo, no intervienen en la publicación. Si deseas una vista local puedes usar `node scripts/serve.mjs`; para validar, `node --test tests/*.test.mjs`.

Cartografía © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Clima y búsqueda: [Open-Meteo](https://open-meteo.com/), datos geográficos de [GeoNames](https://www.geonames.org/). Tipografías Google Fonts con alternativa de sistema.
