// /api/viviendas  ->  GET (lista) y POST (registrar)
import { json, bad, readJson, clientIp, guard } from '../../lib/http.js';
import { listViviendas, createVivienda, setFotos, getVivienda } from '../../lib/db.js';
import { decodePhotos } from '../../lib/validation.js';
import { putPhoto } from '../../lib/photos.js';
import { verifyTurnstile } from '../../lib/turnstile.js';

export function onRequestGet({ env }) {
  return guard(async () => json({ viviendas: await listViviendas(env) }));
}

export function onRequestPost({ request, env }) {
  return guard(async () => {
    const body = await readJson(request);
    const ip = clientIp(request);

    if (!(await verifyTurnstile(env, body.turnstile, ip)))
      return bad('Verificación anti-spam fallida. Recarga la página e inténtalo de nuevo.');
    if (!body.consent)
      return bad('Debes aceptar el aviso para continuar.');
    if (!body.contacto || !String(body.contacto).trim())
      return bad('El contacto es obligatorio.');

    // Acepta varias fotos (body.fotos = array) o una sola (body.foto).
    const photos = decodePhotos(body.fotos || body.foto); // puede lanzar HttpError si una es muy grande
    const id = await createVivienda(env, body);
    if (photos.length) {
      const paths = [];
      for (let i = 0; i < photos.length; i++) paths.push(await putPhoto(env, id, photos[i], i));
      await setFotos(env, id, paths);
    }
    return json(await getVivienda(env, id), 201);
  });
}
