-- Datos de ejemplo para desarrollo local.
-- Aplícalo en local: npm run db:seed:local
-- NO lo apliques en producción.

DELETE FROM opinions;
DELETE FROM viviendas;

INSERT INTO viviendas (id,nombre,contacto,ubicacion,sector,tipo,pisos,piso,construccion,damages,descripcion,foto,created_at) VALUES
 ('v1','Familia Rodríguez','privado@ejemplo','Chacao, Caracas','Av. Francisco de Miranda','apartamento','8','5','Concreto armado','["Grietas en paredes","Vidrios rotos"]','Grietas finas en la sala y el cuarto principal, varios vidrios rotos. El edificio se sintió muy fuerte durante el sismo.',NULL, strftime('%s','now')*1000-50000),
 ('v2','José Pernía','privado@ejemplo','El Llano, Mérida','Calle 24 con Av. 3','casa','1','1','Bloque','["Grietas en paredes"]','Apareció una grieta diagonal sobre la ventana del frente después de la réplica de anoche.',NULL, strftime('%s','now')*1000-45000),
 ('v3','Carmen Liscano','privado@ejemplo','Petare, Caracas','Sector La Línea','edificio','12','9','Concreto armado','["Grietas en columnas o vigas","Inclinación del edificio"]','Una columna del estacionamiento tiene una grieta grande en forma de X y el edificio parece inclinado hacia un lado.',NULL, strftime('%s','now')*1000-40000),
 ('v4','María Antúnez','privado@ejemplo','Valera, Trujillo','Urb. Las Acacias','apartamento','4','2','Bloque','["Ninguno aparente"]','Revisé toda la casa y no veo grietas, solo cayeron cosas de los estantes.',NULL, strftime('%s','now')*1000-30000),
 ('v5','Familia Gómez','privado@ejemplo','Barquisimeto, Lara','Calle 30 entre 18 y 19','casa','2','2','Mixto','["Hundimiento"]','El piso del fondo se hundió un poco y la puerta principal ya no cierra bien.',NULL, strftime('%s','now')*1000-20000);

INSERT INTO opinions (vivienda_id,nombre,profesion,civ,status,comentario,verified,created_at) VALUES
 ('v1','Ing. Carlos Materán','Ingeniero civil','12345','yellow','Por la foto, las grietas parecen estar en tabiquería (paredes divisorias), no en elementos estructurales. Aun así, entra solo lo imprescindible y con cuidado hasta que un colega pueda revisar en sitio.',1, strftime('%s','now')*1000-44000),
 ('v3','Ing. Daniela Rojas','Ingeniero estructural','20891','red','La grieta en X en una columna es señal de daño estructural por cortante. Con la inclinación reportada, NO deben entrar bajo ninguna circunstancia. Reporten a Protección Civil y soliciten inspección presencial urgente.',1, strftime('%s','now')*1000-39000),
 ('v3','Arq. Luis Bravo','Arquitecto','','yellow','Coincido en que se ve serio. Por prudencia, no entrar hasta una evaluación en sitio.',0, strftime('%s','now')*1000-38000),
 ('v4','Ing. Pedro Suárez','Ingeniero civil','17654','green','En la foto no se aprecian daños estructurales. Sin daños aparentes en la imagen; de todos modos conviene una revisión presencial cuando sea posible.',1, strftime('%s','now')*1000-29000);
