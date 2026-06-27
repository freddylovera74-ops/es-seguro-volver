// Config pública que el frontend necesita conocer (sin secretos).
import { json } from '../../lib/http.js';

export function onRequestGet({ env }) {
  return json({
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || null,
  });
}
