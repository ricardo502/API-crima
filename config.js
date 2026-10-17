// Solo configuración pública. Nunca coloques claves privadas en este archivo.
// Deja los endpoints vacíos para utilizar la demostración local.
window.APP_CONFIG = Object.freeze({
  geocodingEndpoint: '', // Proxy propio: GET ?q=ciudad → [{ name, description, lat, lon }]
  weatherEndpoint: '', // Proxy propio: GET ?lat=…&lon=… → { temperature, humidity, pressure, condition }
});
