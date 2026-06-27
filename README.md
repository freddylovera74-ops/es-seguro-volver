# ¿Es seguro volver?

Plataforma ciudadana de **orientación estructural tras un sismo**. Un vecino sube una foto
y los datos de su vivienda; ingenieros voluntarios dan una orientación tipo **semáforo**
(🟢 habitable · 🟡 uso restringido · 🔴 no entrar) para ayudar a decidir si es seguro volver.

> ⚠️ **Esto orienta, no sustituye una inspección presencial.** Una foto no reemplaza la
> revisión de un profesional en sitio. Ante la duda, **no entres** y llama a las autoridades.

Proyecto **abierto y sin ánimo de lucro**, pensado para responder rápido ante emergencias.
Las contribuciones son bienvenidas — ver [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Arquitectura

Todo corre en **Cloudflare** (gratis en este nivel, escala solo ante picos de tráfico,
con protección DDoS incluida):

| Pieza | Tecnología |
|---|---|
| Frontend (web/PWA) | HTML + JS vanilla, servido por **Cloudflare Pages** |
| API | **Pages Functions** (Workers) — `functions/` |
| Base de datos | **Cloudflare D1** (SQLite serverless) — `schema.sql` |
| Fotos | **Cloudflare R2** (almacenamiento de objetos) |
| Anti-spam | **Turnstile** (opcional) |

```
.
├── public/              Frontend estático (Pages lo sirve)
│   ├── index.html       App principal (PWA instalable)
│   ├── admin.html       Panel de moderación (/admin)
│   ├── sw.js  manifest.webmanifest  icon.svg
│   ├── _headers  _redirects
├── functions/           API serverless (enrutado por archivos)
│   ├── api/viviendas.js              GET lista · POST registrar
│   ├── api/viviendas/[id].js         GET detalle
│   ├── api/viviendas/[id]/opinions.js  POST opinión
│   ├── api/viviendas/[id]/report.js    POST reporte
│   ├── api/opinions/[id]/report.js     POST reporte
│   ├── api/admin/data.js  api/admin/moderate.js   Moderación (token)
│   ├── api/config.js                 Config pública
│   └── uploads/[[path]].js           Sirve fotos desde R2
├── lib/                 Lógica compartida (db, http, validación, semáforo…)
├── schema.sql           Esquema de la base de datos
├── seed.sql             Datos de ejemplo (solo desarrollo)
└── wrangler.toml        Configuración de Cloudflare
```

La lógica de negocio (validación, privacidad del contacto, semáforo) vive en `lib/`,
separada de las rutas en `functions/`, para que sea fácil de leer y de probar.

---

## Desarrollo local

Requisitos: **Node 18+**. No necesitas cuenta de Cloudflare para desarrollar: Wrangler
emula D1 y R2 en tu máquina.

```bash
npm install
npm run db:init:local     # crea las tablas en la D1 local
npm run db:seed:local     # carga datos de ejemplo (opcional)
npm run dev               # abre http://localhost:8788
```

Para probar el **panel de moderación** en local, copia `.dev.vars.example` a `.dev.vars`
y define un `ADMIN_TOKEN`. Entra en `http://localhost:8788/admin` con ese token.

---

## Despliegue en Cloudflare (una vez)

Necesitas una cuenta de Cloudflare (gratis). Instala el CLI: `npm install` ya trae Wrangler.

```bash
npx wrangler login

# 1. Crea la base de datos y copia el database_id que imprime a wrangler.toml
npx wrangler d1 create esv-db

# 2. Crea el bucket de fotos
npx wrangler r2 bucket create esv-fotos

# 3. Crea las tablas en la base de datos de producción
npm run db:init:remote

# 4. Primer despliegue
npx wrangler pages deploy
```

Después, conecta el repositorio de GitHub al proyecto de Pages en el panel de Cloudflare
(**Workers & Pages → tu proyecto → Settings → Builds & deployments → Connect to Git**)
para que cada `git push` despliegue solo. Recuerda enlazar los *bindings* **D1** y **R2**
al proyecto de Pages (Settings → Functions → D1 / R2 bindings) con los nombres `DB` y `BUCKET`.

### Secretos (panel o CLI)

```bash
npx wrangler pages secret put ADMIN_TOKEN      # activa el panel de moderación
npx wrangler pages secret put TURNSTILE_SECRET # opcional, anti-spam
```

La clave pública de Turnstile (`TURNSTILE_SITE_KEY`) va en `wrangler.toml` (no es secreta).

---

## Moderación y seguridad

- El **contacto del afectado nunca se expone** por la API pública.
- Cualquiera puede **reportar** una ficha u opinión sospechosa.
- El panel `/admin` permite **ocultar** contenido falso y **verificar** a los ingenieros
  (distintivo ✓). Requiere el token `ADMIN_TOKEN`.
- **Pendiente recomendado:** verificación previa obligatoria de ingenieros (hoy se verifica
  después, por moderación). Es la siguiente mejora prioritaria — ver
  [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

[MIT](LICENSE). Úsalo, cópialo y mejóralo, especialmente si ayuda en una emergencia.
