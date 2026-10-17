# Atmósfera · API-crima

Aplicación web de exploración geográfica y meteorológica en español, basada en la práctica «Aplicación Web de Mapa Meteorológico Integral».

## Estado actual

- Mapa interactivo de OpenStreetMap con marcador y enlace a mapa completo.
- Ciudades de demostración: Lerma, Monterrey, Madrid y Ciudad de México (también `CDMX`).
- Coordenadas, temperatura, humedad, presión y condición del cielo.
- **El clima es simulado**, identificado en pantalla. Lerma conserva 27.4 °C y 91 % de humedad, como indica la práctica; los demás valores son deterministas, no observaciones reales.
- Búsqueda global y meteorología real pendientes de conectar los proveedores que el propietario suministre.
- Interfaz adaptable a móvil, formulario accesible y manejo de errores, respuestas inválidas y tiempos de espera.

## Ejecutar

Requiere Node.js 20 o superior. No necesita instalar dependencias.

```bash
npm start
```

Abre http://127.0.0.1:4173. El mapa y las fuentes web requieren Internet; hay fuentes de sistema como alternativa.

```bash
npm run check
npm run build
```

`dist/` contiene los archivos estáticos para desplegar. También puedes publicar directamente la raíz del repositorio.

## Conectar APIs

Edita las URLs públicas de `config.js`. Los contratos de integración son:

**Geocodificación:** `GET <geocodingEndpoint>?q=Madrid`

```json
[{ "name": "Madrid", "description": "Comunidad de Madrid, España", "lat": 40.4168, "lon": -3.7038 }]
```

Devuelve `[]` cuando no encuentre resultados. Las cuatro ciudades predefinidas se resuelven localmente; las demás consultan este endpoint y se conservan en caché durante la sesión. La búsqueda solo se dispara al enviar el formulario, sin autocompletado remoto.

**Meteorología:** `GET <weatherEndpoint>?lat=40.4168&lon=-3.7038`

```json
{ "temperature": 22.5, "humidity": 60, "pressure": 1013, "condition": "Parcialmente nublado" }
```

Unidades: °C, %, hPa. Cuando se configura meteorología real, un fallo deja el clima como no disponible, sin sustituirlo por valores simulados. Conectar un proveedor requerirá adaptar su respuesta a este contrato.

**No subas claves privadas a GitHub ni a `config.js`.** Usa un backend o función del alojamiento que guarde esas claves en variables de entorno. Los endpoints deben aceptar peticiones desde el dominio de la web (CORS). GitHub Pages sirve archivos estáticos y no ejecuta ese backend.

El documento propone Nominatim. El servicio público no se ha activado: antes de usarlo debes revisar su [política de uso](https://operations.osmfoundation.org/policies/nominatim/), respetar el máximo agregado de una solicitud por segundo, identificar la aplicación, mostrar atribución, cachear consultas y evitar autocompletado. Para producción, integra un proveedor adecuado o un proxy que gestione esos límites globalmente.

## Publicar por tu cuenta

### GitHub Pages

En el repositorio, abre **Settings → Pages → Deploy from a branch**, selecciona **main**, carpeta **/ (root)** y guarda. No hace falta build ni workflow para esta opción. La dirección habitual será https://ricardo502.github.io/API-crima/ una vez activado Pages.

### Otro alojamiento estático

Comando de build: `npm run build`. Directorio de salida: `dist`. No requiere SPA rewrites. Las rutas de los recursos son relativas y funcionan bajo `/API-crima/`.

## Archivos

- `index.html`, `style.css`: interfaz.
- `app.js`: búsqueda, peticiones, estados y mapa.
- `weather.mjs`: demostración y validación de contratos.
- `config.js`: endpoints públicos.
- `scripts/`: servidor local y build sin dependencias.
- `tests/`: validación de datos y demostración.

Cartografía © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). El mapa se carga desde el visor de OpenStreetMap. Las fuentes DM Sans y Manrope se solicitan a Google Fonts.
