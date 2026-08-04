> **DOCUMENTO DESACTUALIZADO** - Escrito cuando el proyecto se llamaba "Servel" y tenia una
> mecanica de swipe. El producto se renombro a **VotoAFin** y el flujo cambio a cuestionario
> por preguntas con escala Likert + pesos de importancia. Para la guia actualizada ver
> [`sistema-simple.md`](sistema-simple.md).

# Servel - Guia para humanos

> Version explicada como si no supieras nada de codigo. Si sos dev, mejor lee la version tecnica.

---

## De que va la app

Servel es una app de celular que ayuda a la gente a **decidir a quien votar**.

Funciona parecido a Tinder, pero en vez de swipe a personas para salir, haces swipe a candidatos politicos segun **que tanto piensan igual que vos**.

## Los actores del sistema

Hay tres tipos de personas involucradas:

1. **El votante (vos)**: usa la app, responde preguntas, ve sus resultados.
2. **El admin**: es quien mete la data inicial (candidatos, preguntas, noticias). Usa un panel web aparte, no la app.
3. **El backend**: es el "cerebro" que guarda todo y hace las cuentas. Nadie lo ve directamente, solo la app y el admin le hablan.

## El flujo tipico de un votante

1. **Se registra** con usuario, mail y clave.
2. **Inicia sesion** y recibe un "token" (como una pulsera VIP que la app guarda por vos - no tenes que loguearte cada rato).
3. **Elige un tipo de eleccion** (por ejemplo "Presidencial 2025").
4. **Contesta un cuestionario** con preguntas politicas del tipo "Estas de acuerdo con la renta basica universal?" con escala Muy de acuerdo / De acuerdo / Neutral / En desacuerdo / Muy en desacuerdo.
5. Al terminar, aprieta "Ver mi match" y la app le muestra **la lista de candidatos ordenada de mayor a menor afinidad** con su porcentaje al lado. Ejemplo:
   - Ada Perez - 87%
   - Beto Diaz - 62%
   - Cami Rojas - 34%
6. Puede **marcar candidatos como favoritos** (los que le gustaron) o **descartarlos** (los que ni loco).
7. Mientras tanto, puede leer un **feed de noticias** electorales que publica el admin. Y en el perfil de cada candidato ve las **noticias recientes** en las que se lo menciona (se traen automaticamente de Google News: La Tercera, Emol, Meganoticias, Teletrece, etc.).

## Como funciona el "match" (el calculo magico)

Es matematica simple:

1. Cada respuesta tiene un valor del 1 al 5 (Muy en desacuerdo = 1, Muy de acuerdo = 5).
2. Los candidatos tambien tienen respuestas registradas (con el mismo 1 al 5).
3. Por cada pregunta, se compara tu valor con el del candidato:
   - Si respondieron exactamente igual (diferencia = 0), suma **100% de match en esa pregunta**.
   - Si respondieron opuestos (diferencia = 4), suma **0%**.
   - Los casos intermedios suman proporcionalmente.
4. Se saca el **promedio** de todas las preguntas que ambos respondieron.
5. Ese promedio en % es tu match con ese candidato.

### Ejemplo concreto

Vos y Ada respondieron 2 preguntas:

| Pregunta | Tu respuesta | Respuesta de Ada | Diferencia | Match parcial |
|---|---|---|---|---|
| Renta basica | Muy de acuerdo (5) | Muy de acuerdo (5) | 0 | 100% |
| Aborto libre | De acuerdo (4) | Muy de acuerdo (5) | 1 | 75% |

Promedio: (100 + 75) / 2 = **87.5%** de match con Ada.

## Que puede hacer el admin

El admin entra a un **panel web** (que se llama "Django admin", viene gratis con el framework) y puede:

- Crear/editar/borrar **tipos de eleccion** (Presidencial, Municipal, etc.)
- Crear/editar/borrar **candidatos** con foto, partido y propuesta
- Crear/editar/borrar **preguntas** del cuestionario
- Registrar **las posturas** de cada candidato en cada pregunta
- Publicar **noticias** en el feed
- Ver todas las **respuestas y decisiones** de los usuarios (util para estadisticas)

## Que NO hace el backend

Para que quede claro que **no** es responsabilidad de esta pieza:

- **No dibuja pantallas**. Solo devuelve datos crudos (en formato JSON). La app se encarga de dibujar botones, colores y transiciones.
- **No envia mails ni notificaciones push**. Habria que agregarlo despues.
- **No hace pagos**. La app es 100% gratis.
- **No cuenta votos reales**. Ojo con esto: la "decision final" que guarda es solo para tu propio registro y estadisticas; **no reemplaza el voto real en el Servel oficial**.
- **No valida que seas una persona real habilitada para votar**. Cualquiera se puede registrar (con mail y clave). Si quisieramos validar RUT, habria que integrar con el Registro Civil o similar.

## Que es lo que "esta guardado" en el sistema

Pensa en el backend como una biblioteca con estas secciones:

- **Personas**: usuarios registrados con su mail y clave (la clave esta cifrada, nadie la puede leer).
- **Tokens**: la "pulsera VIP" de cada usuario para no tener que loguearse siempre.
- **Cuestionario**: tipos de eleccion, preguntas y opciones de respuesta.
- **Candidatos**: nombre, apellido, partido, ciudad, foto, propuesta electoral, y para que tipos de eleccion se presenta.
- **Posturas de candidatos**: para cada candidato, que respondio a cada pregunta (y opcionalmente por que).
- **Tu actividad**: tus respuestas al cuestionario, tus favoritos, tus descartados, tus decisiones finales, y el cache de tus matches calculados.
- **Noticias**: titulo, descripcion, fecha.
- **Archivos**: las fotos de los candidatos.

## Seguridad basica que ya tiene

- **Las claves estan cifradas** (nadie, ni siquiera el admin, las puede leer en texto plano).
- **Los tokens caducan si el usuario cierra sesion** (o si el admin los invalida).
- **Los datos sensibles del servidor (clave secreta, config) estan en un archivo `.env` aparte** que no se sube al repositorio publico.
- **Solo el admin puede publicar noticias**. Los usuarios normales las ven pero no las pueden editar.
- **Cada usuario solo ve SUS favoritos, SUS descartados y SUS respuestas**. No puede espiar a otros usuarios.

## Y ahora que?

La proxima etapa es hacer la **app en si** (React Native con Expo). El backend ya esta esperando ordenado y con tests que verifican que todo funciona.

Cuando tengas la app corriendo y quieras probarla en tu celular, vas a tener que:
1. Instalar la app **Expo Go** en tu telefono (esta en App Store y Play Store, es gratis).
2. Conectar el telefono a la misma WiFi que tu PC.
3. Correr el proyecto de la app y escanear el QR que te muestre.

Eso es todo, la app se abre en tu celular como si fuera nativa.

---

*Documento generado por Perrito Code Puppy - version 2026-07-24*
