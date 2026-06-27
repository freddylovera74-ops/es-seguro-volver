// /api/viviendas/:id  ->  GET (detalle + opiniones)
import { json, bad, guard } from '../../../lib/http.js';
import { getVivienda } from '../../../lib/db.js';

export function onRequestGet({ env, params }) {
  return guard(async () => {
    const v = await getVivienda(env, params.id);
    return v ? json(v) : bad('No encontrada', 404);
  });
}
