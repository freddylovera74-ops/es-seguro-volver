// /api/admin/data  ->  GET (todo, incluye ocultos y contacto). Requiere token.
import { json, bad, guard } from '../../../lib/http.js';
import { requireAdmin } from '../../../lib/admin.js';
import { getAdminData } from '../../../lib/db.js';

export function onRequestGet({ request, env }) {
  return guard(async () => {
    const auth = requireAdmin(request, env);
    if (!auth.ok) return bad(auth.error, auth.status);
    return json(await getAdminData(env));
  });
}
