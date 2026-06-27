// /uploads/*  ->  sirve las fotos desde R2 con caché larga (son inmutables).
export async function onRequestGet({ env, params }) {
  const key = Array.isArray(params.path) ? params.path.join('/') : params.path;
  if (!key) return new Response('No encontrado', { status: 404 });
  const obj = await env.BUCKET.get(key);
  if (!obj) return new Response('No encontrado', { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('etag', obj.httpEtag);
  return new Response(obj.body, { headers });
}
