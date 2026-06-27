// Capa de acceso a datos (D1 / SQLite). Toda la lógica SQL vive aquí.
// El "contacto" del afectado NUNCA se incluye en las respuestas públicas.
import { clip, safeJSON } from './validation.js';
import { statusKeyFromWorst, statusOf } from './status.js';

// ---------- Lecturas públicas ----------

export async function listViviendas(env) {
  // Una sola consulta agregada: calcula el estado y cuenta opiniones en SQL
  // (no carga todas las opiniones a memoria; escala con muchas filas).
  const sql = `
    SELECT v.id, v.nombre, v.ubicacion, v.sector, v.tipo, v.pisos, v.piso,
           v.construccion, v.damages, v.descripcion, v.foto,
           COUNT(o.id) AS opCount,
           COALESCE(MAX(CASE o.status
             WHEN 'red' THEN 3 WHEN 'yellow' THEN 2 WHEN 'green' THEN 1 ELSE 0 END), 0) AS worst
    FROM viviendas v
    LEFT JOIN opinions o ON o.vivienda_id = v.id AND o.hidden = 0
    WHERE v.hidden = 0
    GROUP BY v.id
    ORDER BY v.created_at DESC`;
  const { results } = await env.DB.prepare(sql).all();
  return results.map((v) => ({
    id: v.id,
    nombre: v.nombre,
    titulo: titulo(v),
    ubicacion: v.ubicacion,
    sector: v.sector,
    tipo: v.tipo,
    pisos: v.pisos,
    piso: v.piso,
    construccion: v.construccion,
    damages: safeJSON(v.damages, []),
    descripcion: v.descripcion,
    foto: v.foto || null,
    opCount: v.opCount,
    statusKey: statusKeyFromWorst(v.worst),
  }));
}

// includeHidden = true sólo para el panel de moderación (incluye contacto y ocultos).
export async function getVivienda(env, id, { includeHidden = false } = {}) {
  const v = await env.DB.prepare('SELECT * FROM viviendas WHERE id = ?').bind(id).first();
  if (!v) return null;
  if (v.hidden && !includeHidden) return null;
  const opSql = `SELECT id, nombre, profesion, civ, status, comentario, verified, presencial, presencial_contacto, hidden, reports, created_at
                 FROM opinions WHERE vivienda_id = ?
                 ${includeHidden ? '' : 'AND hidden = 0'}
                 ORDER BY created_at ASC`;
  const { results: ops } = await env.DB.prepare(opSql).bind(id).all();
  return shapeDetail(v, ops, includeHidden);
}

function shapeDetail(v, ops, admin) {
  const out = {
    id: v.id,
    nombre: v.nombre,
    titulo: titulo(v),
    ubicacion: v.ubicacion,
    sector: v.sector,
    tipo: v.tipo,
    pisos: v.pisos,
    piso: v.piso,
    construccion: v.construccion,
    damages: safeJSON(v.damages, []),
    descripcion: v.descripcion,
    foto: v.foto || null,
    fotos: safeJSON(v.fotos, v.foto ? [v.foto] : []),
    opCount: ops.length,
    statusKey: statusOf(ops),
    opinions: ops.map((o) => ({
      id: o.id,
      nombre: o.nombre,
      profesion: o.profesion,
      civ: o.civ,
      status: o.status,
      comentario: o.comentario,
      verified: !!o.verified,
      presencial: !!o.presencial,
      presencialContacto: o.presencial ? (o.presencial_contacto || '') : '',
      created_at: o.created_at,
      ...(admin ? { hidden: !!o.hidden, reports: o.reports } : {}),
    })),
  };
  if (admin) {
    out.contacto = v.contacto; // sólo para moderación
    out.hidden = !!v.hidden;
    out.reports = v.reports;
  }
  return out;
}

function titulo(v) {
  return (v.sector && v.sector !== '—' ? v.sector : '') || v.ubicacion || 'Vivienda de ' + (v.nombre || 'Vecino/a');
}

// ---------- Escrituras ----------

export async function createVivienda(env, b) {
  const id = 'v' + Date.now().toString(36) + randHex(3);
  const row = {
    id,
    nombre: clip(b.nombre, 80) || 'Vecino/a',
    contacto: clip(b.contacto, 120),
    ubicacion: clip(b.ubicacion, 120) || 'Ubicación no indicada',
    sector: clip(b.sector, 120) || '—',
    tipo: ['casa', 'apartamento', 'edificio'].includes(b.tipo) ? b.tipo : '',
    pisos: clip(b.pisos, 10) || '—',
    piso: clip(b.piso, 10) || '—',
    construccion: clip(b.construccion, 60) || 'No indicada',
    damages: JSON.stringify(
      Array.isArray(b.damages) && b.damages.length ? b.damages.map((d) => clip(d, 60)) : ['No indicados']
    ),
    descripcion: clip(b.descripcion, 2000) || 'Sin descripción adicional.',
    created_at: Date.now(),
  };
  await env.DB.prepare(
    `INSERT INTO viviendas (id,nombre,contacto,ubicacion,sector,tipo,pisos,piso,construccion,damages,descripcion,foto,fotos,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    row.id, row.nombre, row.contacto, row.ubicacion, row.sector, row.tipo,
    row.pisos, row.piso, row.construccion, row.damages, row.descripcion, null, null, row.created_at
  ).run();
  return id;
}

// Asocia las fotos ya subidas: foto = principal (miniatura), fotos = todas (JSON).
export async function setFotos(env, id, paths) {
  await env.DB.prepare('UPDATE viviendas SET foto = ?, fotos = ? WHERE id = ?')
    .bind(paths[0] || null, JSON.stringify(paths), id).run();
}

export async function createOpinion(env, vid, b) {
  const presencial = b.presencial ? 1 : 0;
  await env.DB.prepare(
    `INSERT INTO opinions (vivienda_id,nombre,profesion,civ,status,comentario,presencial,presencial_contacto,created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).bind(
    vid, clip(b.nombre, 80), clip(b.profesion, 80), clip(b.civ, 30), b.status, clip(b.comentario, 2000),
    presencial, presencial ? clip(b.presencialContacto, 120) : '', Date.now()
  ).run();
}

export async function addReport(env, type, id, motivo, ip) {
  const table = type === 'opinion' ? 'opinions' : 'viviendas';
  const exists = await env.DB.prepare(`SELECT 1 AS x FROM ${table} WHERE id = ?`).bind(id).first();
  if (!exists) return false;
  await env.DB.batch([
    env.DB.prepare(`UPDATE ${table} SET reports = reports + 1 WHERE id = ?`).bind(id),
    env.DB.prepare('INSERT INTO reports (target_type,target_id,motivo,ip,created_at) VALUES (?,?,?,?,?)')
      .bind(type, String(id), clip(motivo, 300), ip, Date.now()),
  ]);
  return true;
}

// ---------- Moderación ----------

export async function getAdminData(env) {
  const { results: vs } = await env.DB.prepare(
    'SELECT * FROM viviendas ORDER BY reports DESC, created_at DESC'
  ).all();
  const { results: ops } = await env.DB.prepare(
    'SELECT * FROM opinions ORDER BY created_at ASC'
  ).all();
  const byV = {};
  for (const o of ops) (byV[o.vivienda_id] = byV[o.vivienda_id] || []).push(o);
  const viviendas = vs.map((v) => shapeDetail(v, byV[v.id] || [], true));
  return { viviendas };
}

const ACTIONS = {
  hide: { table: true, set: 'hidden = 1' },
  unhide: { table: true, set: 'hidden = 0' },
  verify: { table: 'opinions', set: 'verified = 1' },
  unverify: { table: 'opinions', set: 'verified = 0' },
};

export async function moderate(env, { action, target, id }) {
  const spec = ACTIONS[action];
  if (!spec) return { ok: false, status: 400, error: 'Acción no válida.' };
  let table;
  if (spec.table === 'opinions') {
    table = 'opinions'; // verificar sólo aplica a opiniones
    if (target && target !== 'opinion') return { ok: false, status: 400, error: 'Sólo se verifican opiniones.' };
  } else {
    table = target === 'opinion' ? 'opinions' : 'viviendas';
  }
  if (id == null || id === '') return { ok: false, status: 400, error: 'Falta el id.' };
  const res = await env.DB.prepare(`UPDATE ${table} SET ${spec.set} WHERE id = ?`).bind(id).run();
  if (!res.meta || res.meta.changes === 0) return { ok: false, status: 404, error: 'No encontrado.' };
  return { ok: true };
}

function randHex(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map((x) => x.toString(16).padStart(2, '0')).join('');
}
