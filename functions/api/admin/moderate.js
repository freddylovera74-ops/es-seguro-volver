// /api/admin/moderate  ->  POST { action, target, id }. Requiere token.
//   action: hide | unhide | verify | unverify
//   target: vivienda | opinion
import { json, bad, readJson, guard } from '../../../lib/http.js';
import { requireAdmin } from '../../../lib/admin.js';
import { moderate } from '../../../lib/db.js';

export function onRequestPost({ request, env }) {
  return guard(async () => {
    const auth = requireAdmin(request, env);
    if (!auth.ok) return bad(auth.error, auth.status);
    const body = await readJson(request);
    const res = await moderate(env, body);
    return res.ok ? json({ ok: true }) : bad(res.error, res.status || 400);
  });
}
