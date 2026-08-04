# Como esta hecha la app — version para todos

> Explicacion sin tecnicismos de las dos mitades de VotoAFin:
> lo que ves en la pantalla y lo que pasa por atras.

---

## Empecemos con una analogia

Imagina un **restaurante**.

Cuando vas a comer, interactuas con:
- La **carta** (que ves)
- El **mesero** (que toma tu pedido y te trae la comida)
- La **mesa** (donde te sientas)

Pero detras hay una **cocina**:
- El **chef** que prepara los platos
- La **despensa** donde estan los ingredientes
- La **receta** que dice como cocinar cada cosa

Nunca ves la cocina. Ni te importa como esta organizada, mientras la
comida llegue rica y a tiempo.

**Una app moderna funciona igual**. Tiene dos partes:

- **Frontend**: la carta, la mesa, el mesero. Lo que **ves y tocas**
  en tu telefono o navegador.
- **Backend**: la cocina. Guarda todos los datos, hace los calculos, y
  responde cuando el frontend le pide algo.

Cada vez que hacer algo en la app — apretar un boton, ver una lista,
guardar tu respuesta — el frontend le pregunta al backend, el backend
responde, y el frontend te muestra el resultado. Todo en segundos.

---

## Que hace el frontend

Es la parte que **corre en tu dispositivo**. Tu telefono, tu laptop, tu
tablet. Es lo que ves cuando abres la app.

Sus tareas:

- **Mostrar pantallas bonitas** (login, cuestionario, resultados,
  detalle de candidato)
- **Guardar temporalmente** lo que estas eligiendo en el cuestionario,
  antes de mandarlo
- **Recibir tus toques** en botones, cambios de texto, scroll
- **Pedirle datos al backend** cuando los necesita (los candidatos, las
  preguntas, tu match)
- **Traducir los datos** en algo visual (barras de progreso, radar,
  colores segun el porcentaje de match)

**VotoAFin tiene 7 pantallas principales**:

1. **Login** — para entrar con tu usuario
2. **Registrarse** — si aun no tienes cuenta
3. **Home** — donde eliges que eleccion (por ahora solo Presidencial)
4. **Cuestionario** — las 12 preguntas de una en una
5. **Enviado** — pantalla intermedia de "listo"
6. **Resultados** — ranking de candidatos con su porcentaje
7. **Detalle de candidato** — perfil, radar de afinidad, noticias

Y ademas hay componentes reutilizables (botones, inputs, notificaciones,
el modal con el "?" que explica cada pregunta) que se usan en varias
pantallas.

**Una cosa interesante**: la misma app funciona en la web y en telefonos
iPhone/Android. Es un solo codigo que se compila para todas las
plataformas. La razon es que usa una tecnologia llamada React Native,
disenada exactamente para esto.

---

## Que hace el backend

Es la parte que **corre en un servidor** (en la nube, en una computadora
lejana que nunca vas a ver). Es la "cocina" de la app.

Sus tareas:

- **Guardar todos los datos** en una base de datos: usuarios, preguntas,
  candidatos, posturas, tus respuestas, tus matches
- **Hacer calculos**: cuando pides tu match, el backend agarra tus
  respuestas, las compara con las posturas de los candidatos, y devuelve
  el ranking (ver [algoritmo-simple.md](algoritmo-simple.md) para como
  funciona ese calculo)
- **Autenticar**: verificar que eres tu cuando entras con usuario+clave,
  y darte un "boleto" (token) para las proximas veces
- **Servir el contenido**: cuando el frontend pide "dame los candidatos",
  el backend responde con la lista

**Que guarda el backend, exactamente**:

- **Usuarios**: nombre de usuario, email, contrasena (encriptada, nadie
  puede leerla en claro)
- **Tipos de eleccion**: Presidencial, Parlamentaria, etc.
- **Candidatos**: nombre, partido, biografia, foto, propuesta
- **Preguntas**: enunciado, categoria tematica, orden, y ahora tambien
  contexto educativo y repercusiones
- **Opciones de respuesta**: Muy de acuerdo, De acuerdo, Neutral, En
  desacuerdo, Muy en desacuerdo, No se
- **Respuestas de los usuarios**: quien contesto que, con que peso
- **Posturas de los candidatos**: que opina cada candidato sobre cada
  pregunta, con justificacion y fuente
- **Matches calculados**: los porcentajes que resultan de comparar tus
  respuestas con las posturas de los candidatos
- **Favoritos y descartados**: si marcaste algun candidato como favorito
  o lo eliminaste
- **Decision final**: si al final elegiste uno
- **Noticias**: articulos de prensa asociados a cada candidato

Todo esto vive en una base de datos (una especie de Excel super
sofisticado, ordenado en tablas).

---

## Como se hablan el frontend y el backend

Se comunican por internet, usando un protocolo llamado **API REST**.
Es como si el mesero (frontend) llenara unos formularios standard para
pasarle el pedido a la cocina (backend), y la cocina le respondiera con
otros formularios.

Ejemplos de "pedidos" que hace la app:

- "Dame la lista de candidatos" → backend responde con un JSON
- "Este usuario quiere entrar, aca esta su contrasena, ¿es valida?" →
  backend responde con `si + token` o `no`
- "El usuario respondio estas 12 preguntas, guarda las respuestas" →
  backend responde `ok`
- "Ahora calculame el match con los candidatos" → backend hace los
  numeros y devuelve el ranking

**La app hace decenas de estos pedidos por sesion**, sin que te des
cuenta. Cada vez que cambias de pantalla o presionas algo, hay un
pequeno viaje frontend → backend → frontend.

---

## ¿Que pasa cuando aprietas "Ver mis matches"?

Paso a paso, lo que ocurre en segundos:

1. **En tu pantalla**: el frontend detecta que apretaste el boton.
2. **El frontend arma un mensaje**: "Hola backend, aca tienes mi token
   (asi sabes que soy yo). Necesito el match para la eleccion
   Presidencial."
3. **El mensaje viaja por internet** hasta el servidor.
4. **El backend recibe el mensaje**. Revisa el token, verifica que eres
   un usuario valido. Si no, corta la comunicacion.
5. **El backend busca en la base de datos**:
   - Tus respuestas al cuestionario
   - Los candidatos de la Presidencial
   - Las posturas de cada candidato en cada pregunta
6. **El backend hace los calculos** para cada candidato:
   - Compara tu respuesta con la postura del candidato pregunta por
     pregunta
   - Considera cuanto te importa cada tema (el peso que le pusiste)
   - Saca un porcentaje global
   - Saca tambien un porcentaje por cada eje tematico (para el radar)
   - Decide el nivel de confianza (tentativa/media/alta) segun cuantas
     preguntas usaste
7. **El backend guarda el resultado** en la base de datos (para no
   recalcularlo si preguntas de vuelta) y lo devuelve al frontend.
8. **El frontend recibe la lista de matches**.
9. **El frontend arma la pantalla**: ordena los candidatos de mayor a
   menor, les pone colores segun el porcentaje, muestra las barras y
   los badges de confianza.
10. **Ves los resultados** en tu pantalla.

Todo esto tarda entre 100 milisegundos y 2 segundos, depende de tu
conexion a internet.

---

## ¿Donde vive todo?

- **El frontend**: cuando la usas en la web, vive momentaneamente en tu
  navegador (Chrome, Safari, Firefox). Cuando la usas como app en tu
  telefono, vive instalada en tu telefono (v2+ del roadmap).
- **El backend**: vive en un servidor. En desarrollo actual, corre en
  la maquina donde estas trabajando. En produccion (cuando salga al
  publico), va a vivir en un proveedor de nube — la app se conecta a
  ese servidor por internet.
- **La base de datos**: vive junto al backend, en el mismo servidor o
  en un servicio dedicado.

---

## ¿Que datos tuyos guarda?

Solo lo necesario para que la app funcione:

- **Usuario y email** (para que puedas entrar de nuevo)
- **Contrasena encriptada** (no la contrasena en si — un codigo derivado
  imposible de revertir)
- **Tus respuestas al cuestionario y sus pesos**
- **Tus matches** (calculados a partir de las respuestas)
- **Favoritos, descartados y decision final** si los usas

**No guarda**:

- Tu ubicacion GPS
- Tus contactos
- Tu foto (a menos que la subas voluntariamente)
- Tu numero de telefono
- Nada de tus otras apps

**No comparte** tus respuestas con:
- Partidos politicos
- Encuestadoras
- Anunciantes
- Otros usuarios

Puedes ver los detalles en el [aviso de privacidad](../README.md) del
proyecto.

---

## ¿Por que separar frontend y backend?

Buena pregunta. Podriamos haber hecho todo junto, pero separarlos tiene
ventajas:

1. **Cambios visuales rapidos**: si queremos cambiar como se ve un
   boton, tocamos solo el frontend sin arriesgar la logica de datos.
2. **Cambios de logica seguros**: si mejoramos el algoritmo de matching,
   tocamos solo el backend sin afectar la interfaz.
3. **Multiples clientes**: manana podriamos tener la app web + iOS +
   Android + un chatbot + un bot de WhatsApp, todos usando el mismo
   backend. No hay que reprogramar nada.
4. **Escalabilidad**: si mucha gente usa la app al mismo tiempo,
   podemos poner mas servidores backend sin tocar nada del frontend.
5. **Seguridad**: los datos sensibles nunca viven en el dispositivo del
   usuario. Solo se prestan momentaneamente cuando hacen falta.

Es el mismo patron que usan Instagram, Uber, Spotify, tu banco, y
practicamente todas las apps que usas todos los dias.

---

## Preguntas frecuentes

**¿Necesito estar conectado a internet para usar la app?**
Si. Como el backend vive en un servidor, cada accion importante requiere
conexion. En un futuro podriamos guardar cache local para que algunas
cosas funcionen offline.

**¿Que pasa si el servidor se cae?**
La app deja de funcionar hasta que vuelve. En prod tendriamos monitoreo
y backups automaticos. En dev, tienes que reiniciar el servidor a mano.

**¿Como se que mis respuestas se guardaron?**
La app te muestra la pantalla "Enviado" solo cuando el backend
confirmo que recibio y guardo tus respuestas. Si algo falla, ves un
mensaje de error en un toast rojo.

**¿Puedo bajar mis datos?**
En esta version del MVP no hay boton de "descargar todo mi historial",
pero es algo del roadmap. Legalmente en Chile lo puedes pedir al
responsable del proyecto y estamos obligados a darte una copia (Ley
19.628 de proteccion de datos personales).

**¿Puedo borrar mi cuenta?**
En esta version no hay boton todavia. Tambien esta en el roadmap. Si lo
necesitas urgente, abri un issue en GitHub.

**¿Es Open Source?**
Si. Todo el codigo esta publicado en GitHub bajo licencia AGPL. Puedes
revisarlo, contribuir, o si quieres armar tu version para otro pais,
tienes que compartir tus modificaciones (esa es la logica de AGPL para
software de interes publico).

---

## Un mapa mental para recordar

```
+-----------------+       +----------------+       +----------------+
| Tu telefono /   |       | Servidor       |       | Base de datos  |
| navegador       |<----->| en la nube     |<----->| (tablas de     |
| (frontend)      |       | (backend)      |       |  datos)        |
+-----------------+       +----------------+       +----------------+
  Ves y tocas             Piensa y decide          Recuerda todo

  React + Expo            Django + Python          PostgreSQL / SQLite
```

Si te acuerdas de esta imagen, ya tienes el 80% de como esta hecha
cualquier app moderna, incluida esta.

---

_Version 1.0 de este documento — 2026-07-25._
_Si algo no se entiende, dinos y lo mejoramos._
