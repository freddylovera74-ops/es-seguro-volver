// Lógica del "semáforo" de seguridad. Una sola fuente de verdad.
//   rojo (no entrar) gana sobre amarillo (uso restringido) gana sobre verde.
//   sin opiniones => pendiente.

export const STATUS_RANK = { green: 1, yellow: 2, red: 3 };

export function statusKeyFromWorst(worst) {
  if (worst >= 3) return 'red';
  if (worst === 2) return 'yellow';
  if (worst === 1) return 'green';
  return 'pending';
}

export function statusOf(opinions) {
  let worst = 0;
  for (const o of opinions) worst = Math.max(worst, STATUS_RANK[o.status] || 0);
  return statusKeyFromWorst(worst);
}
