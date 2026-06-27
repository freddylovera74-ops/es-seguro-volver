// Guardado de fotos en R2. La clave del objeto es "<id>.<ext>";
// la ruta pública servida es "/uploads/<id>.<ext>".

export async function putPhoto(env, id, photo) {
  const key = `${id}.${photo.ext}`;
  await env.BUCKET.put(key, photo.bytes, {
    httpMetadata: { contentType: photo.contentType },
  });
  return `/uploads/${key}`;
}
