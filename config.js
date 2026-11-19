/* Configuración pública del sitio UTC; la clave secreta permanece solo en el Worker. */
window.UTC_ELECTORAL_CONFIG = {
  apiBaseUrl: "https://utc-electoral-consulta-api.cogobierno-2026-2028.workers.dev",
  turnstileSiteKey: "0x4AAAAAAGH7te6IQjzSLzwD",
  electionLabel: "Cogobierno 2026–2028",
  siteLocations: {
    "la matriz": {
      address: "Av. Simón Rodríguez s/n, barrio El Ejido, sector San Felipe, Latacunga, Ecuador",
      mapsUrl: "https://maps.app.goo.gl/zFLBqWShchrYiDpx9"
    },
    "la mana": {
      address: "Av. Los Almendros y calle Pujilí, sector La Virgen, La Maná, Ecuador",
      mapsUrl: "https://maps.app.goo.gl/y6Hd4swmVuPhppZw5"
    }
  }
};
