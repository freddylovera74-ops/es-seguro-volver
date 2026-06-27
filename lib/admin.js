// Autenticación del panel de moderación mediante un token secreto.
// El token se define como secreto ADMIN_TOKEN. Si no está definido, los
// endpoints de administración quedan deshabilitados (nunca abiertos por error).

export function requireAdmin(request, env) {
  if (!env.ADMIN_TOKEN) {
    return { ok: false, status: 503, error: 'Panel de moderación no configurado (falta ADMIN_TOKEN).' };
  }
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !timingSafeEqual(token, env.ADMIN_TOKEN)) {
    return { ok: false, status: 401, error: 'No autorizado.' };
  }
  return { ok: true };
}

// Comparación en tiempo constante para no filtrar el token por temporización.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
