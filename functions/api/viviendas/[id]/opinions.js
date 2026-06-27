// /api/viviendas/:id/opinions  ->  POST (añadir opinión de ingeniero)
import { json, bad, readJson, clientIp, guard } from '../../../../lib/http.js';
import { getVivienda, createOpinion } from '../../../../lib/db.js';
import { verifyTurnstile } from '../../../../lib/turnstile.js';

export function onRequestPost({ request, env, params }) {
  return guard(async () => {
    const body = await readJson(request);

    if (!(await verifyTurnstile(env, body.turnstile, clientIp(request))))
      return bad('Verificación anti-spam fallida. Recarga la página e inténtalo de nuevo.');

    const v = await getVivienda(env, params.id);
    if (!v) return bad('Vivienda no encontrada', 404);

    if (!body.nombre || !String(body.nombre).trim()) return bad('Indica tu nombre.');
    if (!body.profesion || !String(body.profesion).trim()) return bad('Indica tu profesión.');
    if (!['green', 'yellow', 'red'].includes(body.status)) return bad('Selecciona una opinión en semáforo.');
    if (!body.comentario || !String(body.comentario).trim()) return bad('El comentario es obligatorio.');

    await createOpinion(env, params.id, body);
    return json(await getVivienda(env, params.id), 201);
  });
}
