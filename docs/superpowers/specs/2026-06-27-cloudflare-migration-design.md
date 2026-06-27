# Diseño: migración a Cloudflare + moderación

**Fecha:** 2026-06-27
**Estado:** aprobado e implementado

## Contexto

«¿Es seguro volver?» es una plataforma de triaje estructural ciudadano tras un sismo
(ayuda urgente para el terremoto en Venezuela). El código de partida tenía dos versiones:
un prototipo (export de un runtime tipo React, `*.dc.html` + `support.js`) y una versión
de producción limpia en `deploy/` (Node puro + better-sqlite3 + frontend vanilla).

El backend de `deploy/` es **stateful** (SQLite y fotos en disco local), pensado para un
único VPS. Eso choca con el objetivo de desplegar en una plataforma serverless y de
aguantar picos de tráfico bruscos típicos de una emergencia.

## Decisiones

- **Hosting: Cloudflare todo-en-uno** (Pages + Functions + D1 + R2). Gratis en este nivel,
  auto-escala, DDoS incluido, deploy con `git push`. El esquema SQLite migra casi igual a D1.
- **Limpieza:** se elimina el prototipo de la raíz; una sola fuente de verdad.
- **Moderación incluida desde v1** (decisión del responsable).
- **Ruta a autoridades** en casos 🔴 y **aviso legal / consentimiento**.

## Arquitectura

- `public/` → estáticos (Pages). `functions/` → API (enrutado por archivos).
- `lib/` concentra la lógica (db D1, http, validación, semáforo, turnstile, admin),
  separada de las rutas para legibilidad y prueba.
- Fotos en R2; servidas por `functions/uploads/[[path]].js` con caché inmutable.

### Cambios respecto al original

- `better-sqlite3` (sincrónico, archivo) → **D1** (asíncrono). Misma lógica, queries `async`.
  La lista usa una consulta agregada (estado + conteo en SQL) en lugar de cargar todas las
  opiniones a memoria → escala con muchas filas.
- Fotos en disco → **R2**.
- Anti-spam por `Map` en memoria (no válido en serverless) → **Turnstile** (opcional;
  si no hay secreto configurado, no se exige y la app funciona igual).

## Moderación

- Tablas con banderas `hidden` y `reports`; opiniones con `verified`. Tabla `reports`.
- Endpoints `/api/admin/*` protegidos por token (`ADMIN_TOKEN`, comparación en tiempo
  constante). Si el token no está configurado, el panel queda deshabilitado (nunca abierto).
- Panel `/admin` (estático): ocultar/mostrar fichas y opiniones, verificar ingenieros.
- La comunidad puede **reportar** sin fricción (sin Turnstile) para no frenar la denuncia.

## Privacidad y seguridad

- El `contacto` nunca se expone por la API pública (solo en el panel de moderación).
- Todo dato de usuario se escapa en el frontend antes de renderizar.
- Consentimiento obligatorio al registrar; página de aviso legal.

## Riesgo conocido / siguiente paso

Sin **verificación previa** de ingenieros, alguien podría emitir un 🟢 falso. Mitigaciones:
disclaimers fuertes, Turnstile, ruta a autoridades y moderación (verificación posterior +
ocultar). La mejora prioritaria siguiente es la verificación previa obligatoria del CIV.

## Fuera de alcance (YAGNI por ahora)

Cuentas de usuario, mapa/geolocalización, notificaciones al vecino, multidioma. Quedan
listadas en CONTRIBUTING.md como buenas primeras contribuciones.
