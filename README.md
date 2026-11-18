# Paquete de migración institucional UTC

Este paquete contiene el frontend y Worker de consulta electoral listos para configurar bajo las cuentas institucionales. No contiene el padrón ni secretos. No lo conectes a producción hasta confirmar dominio, crear los recursos institucionales y completar la revisión de privacidad/seguridad.

## Pendiente de configurar

- Repositorio GitHub de `consejoelectoral2021-alt` y GitHub Pages.
- Dominio propio UTC, por ejemplo `consulta.utc.edu.ec`, sujeto a disponibilidad y control DNS.
- Nueva base D1 y Worker bajo el Cloudflare institucional.
- Widget Turnstile y secretos nuevos para el Worker.
- Revisión institucional del uso de cédula y acceso público antes de importar el padrón real.

Consulta [la guía de migración](docs/MIGRACION_INSTITUCIONAL_UTC.md) para los pasos. La [revisión de seguridad](docs/REVISION_SEGURIDAD.md) explica los hallazgos y controles pendientes.

`config.js` y `wrangler.toml` están vacíos/neutrales para que ningún servicio de la cuenta personal quede configurado por accidente. No subas archivos Excel, SQL ni el ZIP confidencial al repositorio público.

