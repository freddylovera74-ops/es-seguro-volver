// Saneado de entradas y decodificación de fotos. Sin dependencias.
import { HttpError } from './http.js';

export const MAX_PHOTO = 3 * 1024 * 1024; // 3 MB de imagen decodificada

export function clip(s, n) {
  return s == null ? '' : String(s).trim().slice(0, n);
}

export function safeJSON(s, d) {
  try {
    return JSON.parse(s);
  } catch {
    return d;
  }
}

const PHOTO_RE = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i;

// Devuelve { bytes, ext, contentType } o null si no hay foto válida.
// Lanza HttpError si la foto supera el tamaño máximo.
export function decodePhoto(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const m = PHOTO_RE.exec(dataUrl.trim());
  if (!m) return null;
  const bytes = base64ToBytes(m[2]);
  if (bytes.byteLength > MAX_PHOTO) throw new HttpError('La foto es demasiado grande.', 400);
  const kind = m[1].toLowerCase();
  const ext = kind === 'png' ? 'png' : kind === 'webp' ? 'webp' : 'jpg';
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  return { bytes, ext, contentType };
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) out[i] = bin.charCodeAt(i);
  return out;
}
