// /api/opinions/:id/report  ->  POST (reportar una opinión a moderación)
import { json, bad, readJson, clientIp, guard } from '../../../../lib/http.js';
import { addReport } from '../../../../lib/db.js';

export function onRequestPost({ request, env, params }) {
  return guard(async () => {
    const body = await readJson(request).catch(() => ({}));
    const ok = await addReport(env, 'opinion', params.id, body.motivo, clientIp(request));
    return ok ? json({ ok: true }) : bad('No encontrada', 404);
  });
}
