// Redirige cualquier host "www." a la versión sin www (dominio canónico),
// para que el dominio principal y el widget de Turnstile sean uno solo.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.slice(4);
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
