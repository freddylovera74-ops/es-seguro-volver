-- Esquema de la base de datos (D1 / SQLite).
-- Aplícalo en local:   npm run db:init:local
-- Aplícalo en la nube: npm run db:init:remote

CREATE TABLE IF NOT EXISTS viviendas (
  id TEXT PRIMARY KEY,
  nombre TEXT,
  contacto TEXT,            -- privado: NUNCA se expone por la API pública
  ubicacion TEXT,
  sector TEXT,
  tipo TEXT,
  pisos TEXT,
  piso TEXT,
  construccion TEXT,
  damages TEXT,             -- JSON con la lista de daños
  descripcion TEXT,
  foto TEXT,                -- foto principal (miniatura): ruta servida desde R2
  fotos TEXT,               -- JSON con todas las rutas de fotos (hasta 20)
  hidden INTEGER NOT NULL DEFAULT 0,   -- moderación: 1 = oculta al público
  reports INTEGER NOT NULL DEFAULT 0,  -- nº de reportes recibidos
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS opinions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vivienda_id TEXT,
  nombre TEXT,
  profesion TEXT,
  civ TEXT,                 -- nº de colegiatura CIV (opcional)
  status TEXT,              -- green | yellow | red
  comentario TEXT,
  verified INTEGER NOT NULL DEFAULT 0, -- 1 = ingeniero verificado por moderación
  hidden INTEGER NOT NULL DEFAULT 0,
  reports INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER
);

-- Reportes de la comunidad (para la cola de moderación)
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT,         -- 'vivienda' | 'opinion'
  target_id TEXT,
  motivo TEXT,
  ip TEXT,
  created_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_op_vid ON opinions(vivienda_id);
CREATE INDEX IF NOT EXISTS idx_viv_created ON viviendas(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
