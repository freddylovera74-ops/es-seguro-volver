// Helpers HTTP compartidos por todas las funciones.

export class HttpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const MAX_BODY = 30 * 1024 * 1024; // 30 MB (varias fotos, comprimidas desde el navegador)

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function bad(message, status = 400) {
  return json({ error: message }, status);
}

export async function readJson(request) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > MAX_BODY) throw new HttpError('Envío demasiado grande.', 413);
  const text = await request.text();
  if (text.length > MAX_BODY) throw new HttpError('Envío demasiado grande.', 413);
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new HttpError('JSON inválido', 400);
  }
}

export function clientIp(request) {
  return request.headers.get('cf-connecting-ip') || '';
}

// Envuelve un handler para convertir HttpError en respuesta JSON limpia.
export async function guard(fn) {
  try {
    return await fn();
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    return bad(e.message || 'Error del servidor', status);
  }
}
