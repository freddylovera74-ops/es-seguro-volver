# Cómo contribuir

¡Gracias por querer ayudar! Este proyecto existe para responder rápido ante emergencias,
así que toda mejora suma. No hace falta ser experto.

## Poner el proyecto en marcha

```bash
npm install
npm run db:init:local     # crea las tablas en la D1 local
npm run db:seed:local     # datos de ejemplo
npm run dev               # http://localhost:8788
```

No necesitas cuenta de Cloudflare para desarrollar: Wrangler emula la base de datos (D1)
y el almacenamiento de fotos (R2) en tu máquina.

## Cómo está organizado

- **`lib/`** — la lógica de verdad (acceso a datos, validación, el semáforo de seguridad).
  Si cambias *comportamiento*, casi siempre es aquí.
- **`functions/`** — solo el enrutado de la API. Cada archivo es una ruta; deben quedar
  finos y delegar en `lib/`.
- **`public/`** — el frontend (un único `index.html` con JS vanilla, sin compilación) y el
  panel `admin.html`.

Principios: archivos pequeños y con un solo propósito; nada de dependencias innecesarias;
**todo dato de usuario se escapa** antes de mostrarse (usa `esc()`), nunca se inyecta crudo.

## Flujo de trabajo

1. Crea una rama: `git checkout -b mi-mejora`.
2. Haz el cambio y pruébalo en local con `npm run dev`.
3. Abre un Pull Request describiendo **qué** cambia y **por qué**.

## Ideas donde ayudar (prioridad alta primero)

1. **Verificación previa de ingenieros.** Hoy cualquiera puede emitir una opinión y se
   verifica *después* por moderación. Lo ideal: validar el CIV o aprobar antes de publicar.
   Es lo más importante para la seguridad: un 🟢 falso sobre un edificio peligroso es el
   peor escenario.
2. **Geolocalización / mapa** de las viviendas registradas.
3. **Notificar al vecino** (por su contacto) cuando llega una opinión.
4. **Multidioma** y mejoras de accesibilidad.
5. **Pruebas automatizadas** de la API (`lib/`).

## Una nota sobre el contexto

Esta herramienta puede usarse en situaciones donde una opinión influye en si una familia
entra o no a su casa. Sé prudente: ante la duda, refuerza los avisos de "esto no sustituye
una inspección presencial" en vez de quitarlos.
