# 01 - Que hace el backend

> **Para quien**: alguien sin fondo tecnico que quiere entender de que va este backend.
> **Para que sirve**: entender el rol del backend sin abrir un solo archivo de codigo.

---

## La analogia rapida

Imaginate una **oficina electoral** que:

1. Guarda un **cuadernillo** con todos los candidatos, sus propuestas y sus posturas.
2. Recibe a los ciudadanos que llegan a **responder un cuestionario politico**.
3. Compara **fila por fila** las respuestas del ciudadano con las de cada candidato.
4. Devuelve un **listado ordenado**: "esta persona coincide contigo un 82%, esta otra 60%..."
5. Filtra los candidatos que **te corresponden** segun donde vives (no te muestra al alcalde de otra ciudad).

Ese es el backend. La parte que **piensa**. El frontend (la app en tu telefono) es
solo la cara bonita que le muestra los resultados al usuario.

---

## Que hace concretamente

### 1. Guarda datos

- **Candidatos**: 8 presidenciales, ~140 diputados, ~1000 alcaldes. Con foto, partido,
  biografia y propuesta.
- **Preguntas**: ~40 preguntas politicas sobre temas variados (economia, salud,
  medio ambiente, etc.).
- **Opciones de respuesta**: por cada pregunta, 5 opciones tipo "Muy de acuerdo",
  "De acuerdo", "Neutral", "En desacuerdo", "Muy en desacuerdo".
- **Posturas**: cada candidato ya tiene "elegida" su opcion para cada pregunta.
- **Territorio**: las 16 regiones, 28 distritos electorales y 346 comunas de Chile.
- **Usuarios**: quienes se registran en la app, con su comuna y sus respuestas.

### 2. Autentica usuarios

- **Registro**: usuario nuevo -> se guarda + se le da un "carnet" (token).
- **Login**: usuario ya existe -> le devuelve su token.
- **Reset de password**: "me olvide la clave" -> email con link, cambia la clave.

Todo lo demas que hace la app requiere presentar ese carnet en cada peticion.

### 3. Recibe y guarda respuestas

Cuando respondes el cuestionario, cada respuesta se guarda con:
- Que pregunta.
- Que opcion elegiste.
- Cuanto te importa ese tema (poco / normal / mucho / dealbreaker).

### 4. Calcula matches

Este es el **corazon** del sistema. Ver el detalle sin ecuaciones en
[`03-como-hace-el-match.md`](03-como-hace-el-match.md).

En breve: por cada candidato, ve cuanto se parecen sus posturas a las tuyas,
pondera por lo que te importa cada tema, y devuelve un porcentaje 0-100.

### 5. Filtra por territorio

No te muestra candidatos que no puedes votar:
- Si vives en Nunoa, solo ves alcaldes de Nunoa (no de Providencia).
- Solo ves diputados del distrito 10 (el que contiene Nunoa).
- Ves a todos los presidenciales (son de nivel nacional).

### 6. Guarda bookmarks

- **Favoritos**: candidatos que te llamaron la atencion.
- **Descartados**: candidatos que definitivamente no.
- **Decision final**: tu voto elegido (por tipo de eleccion).
- **Noticias guardadas**: articulos que quieres leer despues.
- **Posturas guardadas**: cuando quieres citar la postura X del candidato Y.

### 7. Trae noticias

Un pequeno script (opcional) sale a Google News RSS a buscar noticias por
candidato y las guarda. La app las muestra en el perfil de cada uno.

---

## Que NO hace el backend

- **No decide por ti**. Solo compara respuestas con posturas.
- **No accede a tu registro real de votante**. No sabe si estas inscrito o donde
  votaste antes. Solo sabe la comuna que TU dijiste.
- **No comparte tus respuestas con nadie**. Estan solo en la DB del sistema.
- **No hace analitica de terceros**. No hay tracking ni ads.
- **No es la app**. Es el "cerebro" que corre en un servidor. La app (el frontend)
  es lo que ves en tu telefono.

---

## Como se relaciona con el frontend

```
+-----------------+                   +--------------+
|   App mobile    | -- pregunta -->   |   Backend    |
|   (frontend)    |                   |   (Django)   |
|                 | <-- responde ---  |              |
+-----------------+                   +------+-------+
                                             |
                                             v
                                       +----------+
                                       | Base de  |
                                       |  datos   |
                                       +----------+
```

Cada vez que la app necesita algo (candidatos, hacer login, calcular match),
manda una **peticion HTTP** al backend. El backend responde con **JSON** (un
formato de datos que la app sabe leer).

Ejemplo simplificado:

```
App -> Backend: "GET /api/v1/candidatos/?tipo_eleccion=Presidencial"
Backend -> DB: SELECT * FROM candidato WHERE tipo = presidencial
Backend -> App: [{"id":1,"nombre":"..","..."}, ...]  (en JSON)
App: muestra la lista al usuario
```

---

## Que tecnologia usa

- **Python**: el lenguaje de programacion.
- **Django**: el framework que estructura el backend.
- **Django REST Framework**: la extension que hace facil crear el API.
- **SQLite** (en desarrollo) / **PostgreSQL** (en produccion): la base de datos
  que guarda todo.

Pero eso ya es detalle tecnico. Para saber que hay dentro, mira los otros docs
de esta carpeta.

---

## Siguiente lectura

- [`02-datos-que-guarda.md`](02-datos-que-guarda.md) - inventario de lo que hay en la DB.
- [`03-como-hace-el-match.md`](03-como-hace-el-match.md) - el algoritmo explicado sin ecuaciones.
- [`04-como-agregar-cosas.md`](04-como-agregar-cosas.md) - agregar candidatos, preguntas, ejes desde admin.
