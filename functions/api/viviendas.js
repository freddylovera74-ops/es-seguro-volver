// /api/viviendas  ->  GET (lista) y POST (registrar)
import { json, bad, readJson, clientIp, guard } from '../../lib/http.js';
import { listViviendas, createVivienda, setFoto, getVivienda } from '../../lib/db.js';
import { decodePhoto } from '../../lib/validation.js';
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

    const photo = decodePhoto(body.foto); // puede lanzar HttpError si es muy grande
    const id = await createVivienda(env, body, null);
    if (photo) {
      const fotoPath = await putPhoto(env, id, photo);
      await setFoto(env, id, fotoPath);
    }
    return json(await getVivienda(env, id), 201);
  });
}
