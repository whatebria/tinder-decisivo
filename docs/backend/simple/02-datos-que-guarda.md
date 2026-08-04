# 02 - Datos que guarda el backend

> **Para quien**: alguien que quiere saber "que informacion vive en el sistema".
> **Para que sirve**: entender el inventario sin abrir la DB.

---

## Los 4 "cajones" principales

### Cajon 1: Catalogo electoral

Cosas que existen "en el mundo" y el sistema conoce:

- **16 Regiones** de Chile (Arica, Tarapaca, ..., Magallanes).
- **28 Distritos electorales** (D1 a D28).
- **346 Comunas** (todas las de Chile).
- **Tipos de eleccion**: Presidencial 2025, Diputados 2025, Alcaldes 2024, y algunos base transversales.
- **Candidatos**: ~1200 en total.
  - 8 presidenciales oficiales.
  - ~140 diputados ficticios (5 por distrito x 28).
  - ~1000 alcaldes ficticios (3 por comuna x 346).

### Cajon 2: Cuestionario

- **~40 Preguntas** politicas sobre temas variados.
- **5 Opciones de respuesta** por pregunta (Likert: Muy de acuerdo a Muy en desacuerdo).
- **7 Ejes tematicos** para clasificar preguntas: Economia, Sociedad, Ambiente,
  Seguridad, DDHH, Internacional, Institucional.
- **Posturas de candidatos**: cada candidato tiene sus 40 opciones "ya elegidas"
  para las preguntas. En total, ~15000 posturas guardadas.

### Cajon 3: Usuarios

Por cada persona registrada:

- **Datos basicos**: username, email, password (encriptado).
- **Token**: el "carnet" para hacer peticiones.
- **Perfil**: la comuna donde vive (opcional pero recomendado).
- **Respuestas**: sus respuestas al cuestionario.
- **Matches calculados**: el porcentaje de coincidencia con cada candidato.

### Cajon 4: Interacciones del usuario

Cosas que el usuario "marca" en la app:

- **Favoritos**: candidatos guardados.
- **Descartados**: candidatos ocultados.
- **Noticias guardadas**: articulos marcados para leer.
- **Posturas guardadas**: cuando quiere anotar una postura especifica.

---

## Que NO se guarda

- **Historial de navegacion** en la app.
- **Location** GPS.
- **Contactos** ni datos externos del telefono.
- **Analitica** de terceros (Google Analytics, Facebook, etc.).
- **Tarjetas** ni datos de pago (la app es gratis).
- **Documentos** (RUT, carnet, etc.). Nunca los pide.

---

## Volumen tipico

| Cajon | Filas aproximadas |
|---|---:|
| Regiones + Distritos + Comunas | 390 |
| Unidades territoriales (polimorfico) | 390 |
| Ejes | 7 |
| Tipos de eleccion | 4 |
| Preguntas | 40 |
| Opciones de respuesta | 200 |
| Candidatos | 1200 |
| Posturas de candidatos | 15000+ |
| Usuarios (crece con adopcion) | variable |
| Respuestas por usuario (max) | 40 |
| Matches por usuario | ~1200 (uno por candidato) |
| Noticias (crece con scraping) | miles |

---

## Como se conectan

**Ejemplo real**: Juan vive en Nunoa. Se registra en la app.

1. Se crea un `User` con username="juan".
2. Se auto-crea un `UserProfile` vinculado, inicialmente sin comuna.
3. Juan setea su comuna = Nunoa. Se guarda en `UserProfile.comuna`.
4. Automaticamente el sistema tambien setea la `unidad_territorial` correspondiente
   (para el filtro territorial).
5. Juan responde 30 preguntas. Se crean 30 `RespuestaUsuario` con su opcion + peso.
6. Juan pide su match. El sistema:
   - Filtra candidatos: alcaldes de Nunoa + diputados del D10 + presidenciales.
   - Calcula porcentaje contra cada uno.
   - Guarda ~15 `MatchCandidato` con resultados.
7. Juan marca al alcalde X como favorito -> `CandidatoFavorito(user=juan, candidato=X)`.
8. Juan lee una noticia sobre X y la guarda -> `NoticiaBookmark(user=juan, noticia=Y)`.

Todo eso es "el estado" de Juan en el sistema. Si se borra su cuenta, todo esto
tambien (CASCADE).

---

## Privacidad

- **Passwords**: nunca se guardan en texto plano. Se hashean con PBKDF2/SHA-256.
- **Emails**: no se comparten. Solo se usan para reset de password.
- **Respuestas**: son privadas. Nadie mas las ve.
- **Matches**: son privados. Solo el usuario los consulta.
- **Bookmarks**: son privados. Nadie ve tus favoritos.

Los datos de **candidatos** y **preguntas** si son publicos (los ve cualquier
usuario, es el punto del sistema).

---

## Siguiente lectura

- [`01-que-hace-el-backend.md`](01-que-hace-el-backend.md) - vision general.
- [`03-como-hace-el-match.md`](03-como-hace-el-match.md) - como usa estos datos para calcular matches.
- [`04-como-agregar-cosas.md`](04-como-agregar-cosas.md) - agregar/editar candidatos y preguntas.
