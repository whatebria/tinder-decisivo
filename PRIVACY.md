# Politica de privacidad - Tinder Decisivo

_Ultima actualizacion: 2026-07-30_

Tinder Decisivo (matchVote) esta pensado como infraestructura civica sin fines de lucro. Esta pagina describe que datos recolectamos, para que, y que **no** hacemos con ellos.

## Datos que NO recolectamos

- **RUT chileno**
- **DNI o documentos de identidad**
- **Numero de telefono**
- **Direccion fisica exacta**
- **Geolocalizacion en tiempo real**
- **Numero de tarjeta bancaria**
- **Datos biometricos** (huellas, reconocimiento facial)
- **Datos de salud**

Nunca solicitamos esta informacion. Si algun campo del formulario te la pide, es un bug — reportalo.

## Datos que SI recolectamos

- **Email**: unicamente para login, recuperacion de password y notificaciones opcionales de nuevas elecciones.
- **Password hasheado**: usando PBKDF2 (algoritmo por default de Django). Nunca vemos tu password en texto plano.
- **Comuna de residencia** (opcional): para mostrarte candidatos que compiten en tu territorio. Podes usar la app sin declararla.
- **Respuestas al cuestionario**: para calcular tu match. Solo vos las ves.
- **Favoritos y descartados**: los candidatos que marcaste.

## Que hacemos con esos datos

- Calcular tu match con los candidatos disponibles.
- Filtrar candidatos por tu comuna (si la declaraste).
- Permitir que retomes el cuestionario donde lo dejaste.
- Guardar tus favoritos entre sesiones.

## Que NO hacemos

- **No vendemos** datos a terceros. Nunca.
- **No compartimos** con partidos politicos, candidatos, medios ni empresas.
- **No hay publicidad** en la app.
- **No hay tracking** de comportamiento (Google Analytics, Facebook Pixel, etc).
- **No filtramos** tu email a otros usuarios.
- **No usamos** LLMs con tus datos.

## Guest mode

Podes usar la app **sin crear cuenta**. En ese modo:
- No guardamos nada del lado del servidor.
- Tus respuestas viven en el navegador (localStorage).
- El match se calcula al vuelo y no se persiste.

Es la opcion mas privada disponible.

## Almacenamiento y transferencia

- Base de datos: PostgreSQL en produccion (Chile, si es posible por hosting).
- Encriptacion en transito: HTTPS obligatorio en produccion (TLS 1.2+).
- Cookies: solo `HttpOnly`, `Secure`, `SameSite=Lax`.
- Tokens de sesion: TTL configurable, rotan en cada login, se invalidan en logout.

## Tus derechos

Tenes derecho a:
- **Acceder** a los datos que tenemos sobre vos (endpoint `GET /perfil/`).
- **Corregir** cualquier dato incorrecto (endpoint `PATCH /perfil/`).
- **Eliminar tu cuenta y todos tus datos** en cualquier momento (endpoint `DELETE /perfil/`).
- **Portabilidad**: exportar tus respuestas en JSON (proximamente).

Todo desde la app, sin trámites.

## Terceros mencionados

- **CONADI, SENADIS, INE, Servicio Electoral**: fuentes publicas de datos electorales. No compartimos datos personales con ellos.
- **Sentry** (produccion): capturamos errores del cliente/servidor con `send_default_pii=False` — sin emails ni IPs sin consentimiento.

## Contacto

Bugs, dudas, quejas: **https://github.com/whatebria/tinder-decisivo/issues**

Autora: Jenifer Castillo (@whatebria).

## Cambios en esta politica

Cambios sustanciales se anunciaran en el repositorio y (si tenes cuenta) via notificacion in-app.
