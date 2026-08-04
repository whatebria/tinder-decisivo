# 04 - Como agregar cosas al sistema

> **Para quien**: admin de contenido, product manager, o cualquiera con acceso al panel.
> **Para que sirve**: agregar candidatos, preguntas, ejes o territorio sin tocar codigo.

---

## Requisito: acceso al admin

El panel de Django Admin vive en `http://tu-servidor.cl/admin/`.

Para acceder necesitas un **usuario staff** (creado por un dev con
`createsuperuser`). Usa tu username + password y entras.

Todo lo que sigue asume que ya estas logueado en el admin.

---

## Agregar un candidato nuevo

**Cuando hacerlo**: llego un candidato nuevo (por ejemplo, un independiente que
se agrego a ultima hora, o el equipo verifico nuevos datos).

1. En el admin, ir a **Core > Candidatos**.
2. Click en **Agregar Candidato** (arriba a la derecha).
3. Llenar los campos:
   - **Nombre** / **Apellido** / **Partido**: obligatorios.
   - **Bio**: parrafo breve.
   - **Propuesta electoral**: resumen del programa (parrafo).
   - **Profile picture**: subir foto. Default es una imagen generica.
   - **Lista electoral**: pacto o lista (ej. "Unidad por Chile"). Opcional.
   - **Tipos eleccion**: elegir uno o mas (ej. "Presidencial 2025"). Se pueden
     marcar varios si el candidato compite en distintos niveles.
   - **Unidad territorial**: setea el territorio del candidato. Si es alcalde de
     Nunoa, elegis `[comunal] Nunoa`. Si es diputado del Distrito 10, elegis
     `[distrital] D10`. Si es presidencial, dejas en blanco (alcance nacional).
4. Guardar.

Despues de crear el candidato, ir a la seccion **Posturas Candidato** y crear
sus posturas para cada pregunta (o correr el comando `seed_preguntas_por_tipo`
para generarlas automatico segun su partido).

---

## Agregar una pregunta nueva

1. Ir a **Core > Preguntas**.
2. Click en **Agregar Pregunta**.
3. Llenar:
   - **Texto**: la pregunta como la vera el usuario. Ej. "El Estado deberia
     financiar universidades gratuitas para todos los estudiantes."
   - **Tipo eleccion**: a que eleccion aplica. Si es transversal, elegis un
     tipo con `es_base=True`.
   - **Eje**: elegir uno del catalogo (Economia, Sociedad, etc.). Si no esta,
     crearlo primero (ver mas abajo).
   - **Orden**: numero para controlar el orden de aparicion. Mayor = mas tarde.
   - **Explicacion**: parrafo educativo neutro sobre el tema. Aparece cuando el
     usuario toca "info".
   - **Repercusiones**: JSON con dimensiones. Ejemplo:
     ```json
     {
       "economico": "Aumenta gasto publico ~2% PIB",
       "social": "Amplia acceso a educacion superior",
       "cultural": "Cambia percepcion sobre educacion",
       "ambiental": "-",
       "institucional": "Requiere reforma constitucional"
     }
     ```
4. Guardar.

Al guardar, el sistema **auto-crea las 5 opciones estandar** (Muy de acuerdo,
De acuerdo, Neutral, En desacuerdo, Muy en desacuerdo) via helper.

---

## Editar/agregar posturas de un candidato

Cada candidato tiene una postura por pregunta.

1. Ir a **Core > Posturas Candidato**.
2. Click en **Agregar Postura Candidato**.
3. Elegir:
   - **Candidato**.
   - **Pregunta**.
   - **Opcion respuesta**: cual opcion elige el candidato.
   - **Justificacion**: parrafo opcional. Recomendable para transparencia.
4. Guardar.

**Regla**: cada (candidato, pregunta) es unica. Si ya existe, se edita en vez
de crear.

**Bulk**: si quieres cargar cientos de posturas de golpe, usa el comando
`import_posturas` con un CSV. Ver [`../tecnico/06-comandos-seeds.md`](../tecnico/06-comandos-seeds.md).

---

## Agregar un eje tematico nuevo

Los ejes tematicos son las categorias que agrupan preguntas (Economia, Sociedad,
Ambiente, etc.).

1. Ir a **Core > Ejes**.
2. Click en **Agregar Eje**.
3. Llenar:
   - **Codigo**: slug en mayusculas. Ej. `EDUCACION`.
   - **Nombre**: como se muestra al usuario. Ej. `Educacion`.
   - **Color**: hex, ej. `#FF6B35`. Se usa en el radar chart de resultados.
   - **Icono**: opcional. Nombre de un icono de Ionicons/Lucide (ej. `book`).
   - **Orden**: numero para ordenar visualmente.
   - **Activo**: si esta en falso, no se muestra al usuario.
   - **Descripcion**: tooltip educativo, opcional.
4. Guardar.

Ahora podes vincular preguntas nuevas a este eje. Los ejes son **dinamicos**:
agregar uno no requiere un deploy nuevo.

---

## Agregar un tipo de eleccion nuevo

Ej: "Consejeros Regionales 2027".

1. Ir a **Core > Tipos Eleccion**.
2. Click en **Agregar Tipo Eleccion**.
3. Llenar:
   - **Nombre**: ej. "Consejeros Regionales 2027".
   - **Descripcion**: contexto.
   - **Fecha eleccion**: fecha oficial.
   - **Anio**: ej. 2027 (permite reutilizar el nombre en anios distintos).
   - **Es base**: **NO** marcar (esto es solo para tipos transversales de preguntas).
4. Guardar.

Ahora podes crear candidatos + preguntas asociadas a este tipo. El sistema los
maneja automaticamente en el matching.

---

## Setear la comuna de un usuario (a mano)

Normalmente el usuario lo hace en la app, pero por si necesitas correcion:

1. Ir a **Core > Perfiles de usuario** (`UserProfile`).
2. Buscar el usuario por username.
3. Setear el campo **Comuna**.
4. Guardar.

Automaticamente, la `Unidad territorial` se sincroniza (via signal). No hace
falta setearla a mano.

---

## Ver los matches de un usuario

Para debug o soporte:

1. Ir a **Core > Match Candidato**.
2. Filtrar por usuario.
3. Ver los porcentajes, breakdown por eje, y ultima actualizacion.

---

## Ver las respuestas de un usuario

1. Ir a **Core > Respuesta Usuario**.
2. Filtrar por usuario.
3. Ver que respondio a cada pregunta y con que peso.

---

## Bulk operations (para muchas cosas de golpe)

El admin es comodo para 1-20 items. Para volumenes grandes, mejor usar
management commands (necesitan acceso a la terminal del servidor).

- **Candidatos**: `import_candidatos <archivo.csv>`.
- **Preguntas**: `import_preguntas <archivo.csv>`.
- **Posturas**: `import_posturas <archivo.csv>` (**requiere fuente_url**).
- **Territorio**: `seed_territorio_chile` (idempotente, se puede correr siempre).

Detalle en [`../tecnico/06-comandos-seeds.md`](../tecnico/06-comandos-seeds.md).

---

## Que no borrar (por favor)

- **Regiones/Distritos/Comunas**: son referencia base. Si las borras, se rompen
  candidatos y perfiles enlazados.
- **Unidad territorial "NACIONAL"**: es la raiz. Si la borras, se rompe la
  jerarquia.
- **Tipos de eleccion en uso**: si hay candidatos vinculados, no se puede
  borrar (PROTECT).

En general, el admin te va a **frenar** si intentas borrar algo con
dependencias. Escucha el error.

---

## Siguiente lectura

- [`05-troubleshooting.md`](05-troubleshooting.md) - problemas comunes y soluciones.
- [`../tecnico/06-comandos-seeds.md`](../tecnico/06-comandos-seeds.md) - bulk commands.
