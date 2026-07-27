# 02 - Modelos de dominio

> **Para quien**: devs que quieren entender el data model.
> **Para que sirve**: mapear que datos vivimos, sus relaciones y las reglas.

---

## Vista general

Son **12 modelos** (mas `auth.User` y `auth.Token` de Django). Organizados en
`core/models/` con **un archivo por bounded context**:

| Archivo | Modelo(s) | Domino |
|---|---|---|
| `auth.py` | `PasswordResetToken` | Tokens single-use para reset de password |
| `content.py` | `Noticia` | Noticias asociadas a candidatos |
| `cuestionario.py` | `Pregunta`, `OpcionRespuesta`, `RespuestaUsuario` | Cuestionario y respuestas del usuario |
| `eje.py` | `Eje` | Catalogo de ejes tematicos (economia, salud, etc.) |
| `electoral.py` | `TipoEleccion`, `Candidato` | Elecciones y candidatos |
| `matching.py` | `PosturaCandidato`, `MatchCandidato` | Posturas de los candidatos y resultado del match |
| `perfil.py` | `UserProfile` | Perfil extendido del usuario (comuna) |
| `territorio.py` | `Region`, `Distrito`, `Comuna` | Division politica-administrativa chilena |
| `unidad_territorial.py` | `UnidadTerritorial` | Modelo polimorfico jerarquico de territorio |
| `user_data.py` | `CandidatoFavorito`, `CandidatoDescartado`, `DecisionFinal`, `NoticiaBookmark`, `PosturaBookmark` | Bookmarking del usuario |

Todos re-exportados desde `core/models/__init__.py` para que
`from core.models import Candidato` funcione.

---

## Diagrama de relaciones (alto nivel)

```
            +-----------+
            |   User    |  (django.contrib.auth)
            +-----+-----+
                  | 1:1
                  v
            +-----------+          +--------+
            |UserProfile|--FK--->  | Comuna |
            +-----------+          +--------+
                                        | (FK region, distrito)
                                        v
                            +------------------+
                            | Region, Distrito |
                            +------------------+
                                    ^
                                    | sync via signal
                                    v
                            +-------------------+
                            | UnidadTerritorial |  (polimorfica, self-FK padre)
                            +-------------------+
                                    ^
                                    | FK unidad_territorial
                                    |
            +-----------+           |
            | Candidato |-----------+
            +-----+-----+
                  |
                  | M2M
                  v
            +-------------+
            |TipoEleccion |
            +------+------+
                   | 1:N
                   v
            +-----------+           +-----+
            | Pregunta  |--FK--->   | Eje |
            +-----+-----+           +-----+
                  | 1:N
                  v
            +----------------+
            | OpcionRespuesta|
            +----------------+
                  ^
                  | FK opcion_elegida
                  |
            +------------------+
            | RespuestaUsuario | <-- FK user
            +------------------+

            +--------------------+
            | PosturaCandidato   | <-- FK candidato, pregunta, opcion_respuesta
            +--------------------+

            +----------------+
            | MatchCandidato | <-- FK user, candidato + porcentaje + breakdown_por_eje
            +----------------+
```

---

## Detalle por modelo

### 1. `TipoEleccion` (`electoral.py`)

Cada tipo de eleccion (Presidencial 2025, Diputados 2025, Alcaldes 2024, etc.).

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | `CharField(100)` unique | ej. `"Presidencial 2025"` |
| `descripcion` | `TextField` blank | opcional |
| `fecha_eleccion` | `DateField` null | fecha oficial |
| `anio` | `IntegerField` null | permite reutilizar `nombre="Presidencial"` en varios anios |
| `es_base` | `BooleanField` false | **si True**: las preguntas de este tipo se agregan a TODAS las elecciones. Sirve para preguntas transversales (ideologia general). |

Relaciones:
- `candidatos` (M2M reverse desde `Candidato.tipos_eleccion`)
- `preguntas` (1:N reverse desde `Pregunta.tipo_eleccion`)

### 2. `Candidato` (`electoral.py`)

Un candidato registrado, con propuesta electoral y datos personales.

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | `CharField(100)` | |
| `apellido` | `CharField(100)` blank | |
| `partido` | `CharField(200)` | |
| `bio` | `TextField` null | |
| `ciudad` | `CharField(100)` blank | |
| `propuesta_electoral` | `TextField` | resumen de propuesta |
| `profile_picture` | `ImageField` | default `assets/default.avif`, upload_to `profiles/` |
| `tipos_eleccion` | `M2M(TipoEleccion)` | un candidato puede competir en varios tipos |
| `comuna` | `FK(Comuna)` null PROTECT | usado por alcaldes |
| `distrito` | `FK(Distrito)` null PROTECT | usado por diputados |
| `unidad_territorial` | `FK(UnidadTerritorial)` null PROTECT | **nuevo, canonico**. Reemplaza comuna/distrito |

Constraints:
- `CheckConstraint`: NO puede tener `comuna` Y `distrito` seteados a la vez.
- `clean()` valida lo mismo con mensaje amigable para admin/forms.

Property: `alcance_territorial` -> `"nacional" | "distrital" | "comunal"`.

**Nota**: `comuna` y `distrito` son deprecated en favor de `unidad_territorial`, pero siguen soportados para retrocompat. Ver [`../simple/03-como-hace-el-match.md`](../simple/03-como-hace-el-match.md) para la logica de matching territorial.

### 3. `Pregunta` (`cuestionario.py`)

Una pregunta del cuestionario.

| Campo | Tipo | Notas |
|---|---|---|
| `texto` | `TextField` | |
| `tipo_eleccion` | `FK(TipoEleccion)` CASCADE | |
| `orden` | `IntegerField` default 0 | orden de aparicion |
| `eje_tematico` | `CharField(20)` choices | codigo del eje (`ECONOMIA`, `SALUD`, etc.). Choices legacy hardcoded pero flexibles via signal |
| `eje` | `FK(Eje)` null SET_NULL | FK canonica al modelo `Eje`. Sincronizada via signal con `eje_tematico`. Metadata rica (color, icono) |
| `explicacion` | `TextField` blank | contexto educativo neutro |
| `repercusiones` | `JSONField` default dict | `{economico, social, cultural, ambiental, institucional}` con textos breves |

Ordering: `["orden"]`.

Signal `pre_save`: sincroniza `eje` <-> `eje_tematico` bi-direccional. Ver `08-signals.md`.

### 4. `OpcionRespuesta` (`cuestionario.py`)

Cada opcion elegible de una pregunta (ej: Muy de acuerdo, De acuerdo, Neutral...).

| Campo | Tipo | Notas |
|---|---|---|
| `pregunta` | `FK(Pregunta)` CASCADE | |
| `texto` | `CharField(255)` | ej. `"Muy de acuerdo"` |
| `valor` | `IntegerField` | valor numerico. Escala Likert 1-5 estandar |
| `es_no_se` | `BooleanField` false | si True, se **excluye del calculo de match** |

Constraint: `unique_together=("pregunta", "texto")`.

Helper: `crear_opciones_acuerdo_desacuerdo(pregunta)` crea las 5 opciones Likert estandar en bulk. Constantes `OPCION_MUY_DE_ACUERDO`, `OPCION_DE_ACUERDO`, `OPCION_NEUTRAL`, `OPCION_EN_DESACUERDO`, `OPCION_MUY_EN_DESACUERDO` disponibles para usar en imports.

### 5. `RespuestaUsuario` (`cuestionario.py`)

Lo que el usuario respondio a una pregunta.

| Campo | Tipo | Notas |
|---|---|---|
| `user` | `FK(User)` CASCADE | |
| `pregunta` | `FK(Pregunta)` CASCADE | |
| `opcion_elegida` | `FK(OpcionRespuesta)` CASCADE | |
| `peso` | `IntegerField` choices | 0=No me importa, 1=Poco, 2=Importante (default), 3=Muy importante |
| `fecha_respuesta` | `DateTimeField` auto_now_add | |

Constraint: `unique_together=("user", "pregunta")` -> una respuesta por (user, pregunta).

El `peso` multiplica el aporte de esa pregunta en el matching (0.5x, 1x, 1.5x, 2x). Ver `04-algoritmo-matching.md`.

### 6. `PosturaCandidato` (`matching.py`)

La postura oficial de un candidato ante una pregunta.

| Campo | Tipo | Notas |
|---|---|---|
| `candidato` | `FK(Candidato)` CASCADE | |
| `pregunta` | `FK(Pregunta)` CASCADE | |
| `opcion_respuesta` | `FK(OpcionRespuesta)` CASCADE | |
| `justificacion` | `TextField` null | opcional, breve justificacion |

Constraint: `unique_together=("candidato", "pregunta")`.

### 7. `MatchCandidato` (`matching.py`)

Resultado persistido del calculo de match para un (user, candidato).

| Campo | Tipo | Notas |
|---|---|---|
| `user` | `FK(User)` CASCADE | |
| `candidato` | `FK(Candidato)` CASCADE | |
| `match_percentage_value` | `DecimalField(5,2)` default 0 | 0.00 a 100.00 |
| `num_preguntas_consideradas` | `IntegerField` default 0 | preguntas donde ambos respondieron |
| `breakdown_por_eje` | `JSONField` default dict | `{eje: {porcentaje, preguntas}}` para radar chart |
| `confianza` | `CharField` choices | `tentativa` / `media` / `alta` (por # de preguntas) |
| `fecha_ultima_actualizacion` | `DateTimeField` auto_now | |

Constraint: `unique_together=("user", "candidato")`.

Umbrales confianza: `<5 tentativa`, `5-9 media`, `>=10 alta` (en `services/matching.py`).

### 8. `Eje` (`eje.py`)

Catalogo de ejes tematicos. Gestionable desde admin sin migration.

| Campo | Tipo | Notas |
|---|---|---|
| `codigo` | `CharField(32)` unique | slug canonico (`ECONOMIA`, `SALUD`). Comparado case-insensitive |
| `nombre` | `CharField(64)` | display |
| `color` | `CharField(7)` default `#666666` | hex, para radar chart |
| `icono` | `CharField(32)` blank | nombre Ionicons/Lucide, opcional |
| `orden` | `IntegerField` 0 | orden de aparicion |
| `activo` | `BooleanField` true | si false, no se muestra al usuario |
| `descripcion` | `TextField` blank | tooltip educativo |

Ordering: `["orden", "nombre"]`.

Reemplaza el `EJES_CHOICES` hardcoded de `Pregunta` (que sigue existiendo por retrocompat). Ver refactor en `07-migraciones.md`.

### 9. `Region`, `Distrito`, `Comuna` (`territorio.py`)

Modelos concretos de la division politica-administrativa chilena.

- **`Region`**: 16 regiones. Campos: `numero_romano` (unique), `codigo` INE 2-digitos (unique), `nombre` unique, `nombre_corto`, `orden` geografico.
- **`Distrito`**: 28 distritos electorales. Campos: `numero` (unique, 1-28), `nombre`, `region` FK PROTECT, `escanos` cantidad de diputados.
- **`Comuna`**: 346 comunas. Campos: `codigo` 5-digitos SUBDERE unique, `nombre`, `region` FK PROTECT, `distrito` FK PROTECT.

Constraint en Comuna: `UniqueConstraint(nombre, region)` (nombres duplicados entre regiones si existen, ej. "Los Angeles").

Signal `post_save` en cada uno: crea/actualiza la `UnidadTerritorial` correspondiente. Ver `08-signals.md`.

### 10. `UnidadTerritorial` (`unidad_territorial.py`)

Modelo polimorfico jerarquico. Consolida `Region`/`Distrito`/`Comuna` bajo una API unica.

| Campo | Tipo | Notas |
|---|---|---|
| `codigo` | `CharField(32)` unique | `NACIONAL`, `REG-XIII`, `D-10`, `COM-13120` |
| `nombre` | `CharField(128)` | |
| `nivel` | `CharField(16)` choices | `nacional`, `regional`, `provincial`, `distrital`, `comunal` |
| `padre` | `FK(self)` null PROTECT | self-ref para jerarquia. Related: `hijos` |
| `metadata` | `JSONField` default dict | `codigo_ine`, `poblacion`, `circunscripcion_senatorial`, etc. |

Indexes: `nivel`, `padre`.

Metodos:
- `ancestros()` -> lista de padres desde el inmediato hasta la raiz.
- `descendientes_ids()` -> set con todos los descendientes recursivos.

**Por que existe**: escalar a senadores/CORE sin migrations. Ver `04-algoritmo-matching.md#filtro-territorial`.

### 11. `UserProfile` (`perfil.py`)

Perfil extendido del user (OneToOne con `auth.User`).

| Campo | Tipo | Notas |
|---|---|---|
| `user` | `OneToOne(User)` CASCADE | related: `profile` |
| `comuna` | `FK(Comuna)` SET_NULL | comuna donde vota |
| `unidad_territorial` | `FK(UnidadTerritorial)` SET_NULL | derivado auto de comuna via signal |
| `fecha_actualizacion` | `DateTimeField` auto_now | |

Se auto-crea via signal `post_save(User)`.
Signal `pre_save(UserProfile)`: sincroniza `unidad_territorial` desde `comuna` (unidireccional para evitar bugs al limpiar).

### 12. `Noticia` (`content.py`)

Noticia scrapeada asociada a candidatos.

| Campo | Tipo | Notas |
|---|---|---|
| `titulo` | `CharField(300)` | |
| `descripcion` | `TextField` | |
| `url` | `URLField(1000)` blank | clave logica para dedup |
| `fuente` | `CharField(200)` blank | "Google News", "La Tercera", etc. |
| `imagen_url` | `URLField(1000)` blank | thumbnail |
| `candidatos_mencionados` | `M2M(Candidato)` | related: `noticias` |
| `fecha_publicacion` | `DateTimeField` auto_now_add | |
| `actualizado_en` | `DateTimeField` auto_now | |

Constraint: `UniqueConstraint(url, condition=~Q(url=""))` -> unique cuando no vacio.
Ordering: `["-fecha_publicacion"]`.

Ver comando `fetch_noticias` en `06-comandos-seeds.md`.

### 13. `PasswordResetToken` (`auth.py`)

Token single-use para reset de password. TTL 1 hora.

| Campo | Tipo | Notas |
|---|---|---|
| `user` | `FK(User)` CASCADE | related: `reset_tokens` |
| `token` | `CharField(64)` unique, indexed | 64-char random hex |
| `created_at` | `DateTimeField` auto_now_add | |
| `expires_at` | `DateTimeField` | por default `now() + 1h` |
| `used_at` | `DateTimeField` null | marca cuando se uso; no se borra (audit) |

Properties: `is_expired`, `is_used`, `is_valid`.
Classmethod: `default_expires_at()`.

### 14. Bookmarking (`user_data.py`)

Cinco modelos M2M-through-like para tracking de usuario:

| Modelo | Relacion | Descripcion |
|---|---|---|
| `CandidatoFavorito` | `(user, candidato)` unique | favoritos del usuario |
| `CandidatoDescartado` | `(user, candidato)` unique | descartados del usuario |
| `DecisionFinal` | `(user, tipo_eleccion)` unique | candidato elegido finalmente por tipo de eleccion |
| `NoticiaBookmark` | `(user, noticia)` unique | noticias guardadas |
| `PosturaBookmark` | `(user, postura_candidato)` unique | posturas guardadas como cita |

Todos tienen `fecha_agregado` auto_now_add y ordering `-fecha_agregado`.

---

## Volumen actual de datos (dev seedeado)

| Modelo | Filas |
|---|---:|
| `Region` | 16 |
| `Distrito` | 28 |
| `Comuna` | 346 |
| `UnidadTerritorial` | 391 (1+16+28+346) |
| `Eje` | 8 canonicos |
| `TipoEleccion` | 3-4 (Presi, Dip, Alc, base) |
| `Pregunta` | ~35-40 |
| `OpcionRespuesta` | ~200 |
| `Candidato` | ~1200 (8 presi + 140 dip + 1038 alc) |
| `PosturaCandidato` | ~15000+ |

---

## Siguiente lectura

- `03-api-endpoints.md` - como se exponen estos modelos via REST.
- `08-signals.md` - los signals que mantienen invariantes (User->Profile, Comuna->UT, etc.).
- `07-migraciones.md` - la historia de como llegamos a este data model.
