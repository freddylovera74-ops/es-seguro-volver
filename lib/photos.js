// Guardado de fotos en R2. La clave del objeto es "<id>-<n>.<ext>";
// la ruta pública servida es "/uploads/<id>-<n>.<ext>".

export async function putPhoto(env, id, photo, index = 0) {
  const key = `${id}-${index}.${photo.ext}`;
  await env.BUCKET.put(key, photo.bytes, {
    httpMetadata: { contentType: photo.contentType },
  });
  return `/uploads/${key}`;
}
