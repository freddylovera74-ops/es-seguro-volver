// Verificación de Turnstile (anti-spam de Cloudflare).
// Es OPCIONAL: si no hay TURNSTILE_SECRET configurado, no se exige
// verificación y la app funciona igual (útil para lanzar rápido y local).

export async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true; // no configurado => no se exige
  if (!token) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const data = await r.json().catch(() => ({ success: false }));
  return !!data.success;
}
