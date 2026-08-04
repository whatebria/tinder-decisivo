> **DOCUMENTO DESACTUALIZADO** - Foto historica; puede no reflejar el estado actual del codigo. Ver `docs/backend/simple/03-como-hace-el-match.md` para la version actualizada.

# Como funciona VotoAFin — version para todos

> Guia sin tecnicismos. Escrita para tu mama, tu abuelo, tu companera de
> trabajo que no programa. Si algo no se entiende, es culpa nuestra, no tuya.

---

## Un ejemplo antes que nada

Imagina que tienes que elegir a alguien para que administre tu casa por
cuatro anos. Tienes 6 postulantes. No los conoces.

Podrias:

- **Opcion A**: leer 6 curriculums de 40 paginas cada uno. Nadie hace eso.
- **Opcion B**: guiarte por la cara o su familia. Poco confiable.
- **Opcion C**: preguntarles 12 cosas concretas ("¿que harias con las
  cuentas de la luz? ¿como manejarias el patio? ¿que reglas pondrias?")
  y ver quien coincide mas contigo.

**VotoAFin hace exactamente lo tercero, pero con candidatos y
politicas publicas.**

---

## Las tres cosas que la app te pregunta

### 1. ¿Que opinas?

Te muestra 12 afirmaciones politicas (por ejemplo: "Chile debe cerrar
las centrales de carbon antes de 2030"). Tu eliges tu postura en una
escala de 5 opciones:

- Muy en desacuerdo
- En desacuerdo
- Neutral
- De acuerdo
- Muy de acuerdo
- (o "No sé, prefiero no responder")

### 2. ¿Cuanto te importa esto?

Despues de cada respuesta, te preguntamos que tan importante es ese
tema para ti:

- No me importa
- Poco importante
- Importante
- Muy importante

Esto es clave: para ti, "aborto" puede ser lo mas importante del
mundo y "impuestos" un tema secundario. Para tu vecino puede ser al
reves. La app respeta eso.

### 3. ¿Que opina cada candidato?

Aca no preguntamos: **ya lo sabemos** (o lo estamos verificando).
Cada candidato tiene una postura registrada en cada pregunta, con
justificacion y link a la fuente donde lo dijo.

---

## Como se calcula el match

Vamos a hacerlo con un ejemplo chico. Digamos que solo hay **1 pregunta**
y **2 candidatos**.

**Pregunta**: "Chile debe cerrar las termoelectricas a carbon antes de 2030"

**Tu respuesta**: Muy de acuerdo (valor 5), Muy importante (peso 3)

**Candidato A**: Muy de acuerdo (valor 5)
**Candidato B**: Muy en desacuerdo (valor 1)

Comparamos:

- Con **A**: piensan lo mismo → **100% de acuerdo en esta pregunta**
- Con **B**: opinan opuesto → **0% de acuerdo en esta pregunta**

Facil, ¿no? Ahora imaginate esto multiplicado por 12 preguntas, con
distintos pesos, y con 6 candidatos. Al final la app te muestra:

| Candidato | Match |
|-----------|------:|
| A         | 84%   |
| C         | 71%   |
| D         | 68%   |
| B         | 55%   |
| ...       | ...   |

---

## ¿Por que no siempre da 100% o 0%?

Porque las opciones intermedias suman parcialmente. Si tu estas
"Muy de acuerdo" y el candidato esta "De acuerdo" (o sea, casi
igual pero no exactamente), el aporte de esa pregunta va a ser
alto pero no perfecto — algo asi como 94%.

Y si estas "Muy de acuerdo" y el candidato esta "Neutral", la
diferencia es mas grande, entonces el aporte de esa pregunta baja
mas fuerte — a algo asi como 75%.

**Regla mental sencilla**: mientras mas grande la diferencia entre
tu opinion y la del candidato, mas se descuenta en el puntaje final.
Y no de forma lineal: una diferencia grande te descuenta *mucho mas*
que dos diferencias chicas.

Esto es a proposito. La app piensa que estar "en las antipodas" en
un tema es peor que estar "cerca pero no exacto" en dos temas.

---

## ¿Como afectan los pesos?

Los pesos multiplican el aporte de cada pregunta.

Si dijiste **"Muy importante"** en una pregunta, esa pregunta pesa
el doble que una donde dijiste "Poco importante". Y pesa cuatro veces
mas que una donde dijiste "No me importa".

Ejemplo: si un candidato piensa como tu en 3 preguntas donde tu
dijiste "Muy importante", pero opina opuesto en 3 preguntas donde tu
dijiste "No me importa", el resultado va a ser un match **alto**. Los
temas que a ti te importan pesan mas.

Al reves: si el candidato coincide contigo en cosas que tu marcaste
como "No me importa" pero difiere en las que dijiste "Muy importante",
el match va a ser **bajo**, aunque coincidan en cantidad de preguntas.

**Los pesos son tu voz diciendole a la app: "estas son mis prioridades
reales".**

---

## ¿Que pasa si respondo "No sé"?

Nada malo. Esa pregunta se ignora **completamente** en el calculo.
Ni suma ni resta.

**Por que es asi**: si tu no tienes opinion, no tiene sentido usar esa
pregunta para medir tu afinidad con nadie. Preferimos un match hecho
con 8 preguntas honestas que uno inflado con 12 respuestas al azar.

---

## ¿Que es la "confianza" del match?

Ademas del porcentaje, cada match viene con un nivel de confianza:

- **Tentativa**: te basaste en menos de 5 preguntas. El match existe
  pero es una estimacion inicial. No tomes decisiones importantes con
  esto sin responder mas.
- **Media**: entre 5 y 9 preguntas. Ya es una senal razonable.
- **Alta**: 10 o mas preguntas. La app tiene suficiente informacion
  como para dar un match solido.

**Punto clave**: el porcentaje y la confianza son **independientes**.
Puedes tener un 90% con confianza tentativa (basado en 3 preguntas y
podria cambiar) o un 55% con confianza alta (basado en 12 preguntas
y es probable que sea real).

Si dos candidatos aparecen con 82% y 80%, pero el primero tiene
confianza alta y el segundo tentativa, es mas probable que en la
realidad el primero sea el mejor match — porque el 80% del segundo
puede subir o bajar mucho al conocer mas.

---

## ¿Y el radar de colores?

Cuando ves el detalle de un candidato, hay un grafico circular con
7 puntas. Cada punta es un **eje tematico**:

- Economia
- Sociedad
- Ambiente
- Seguridad
- Derechos Humanos
- Politica Internacional
- Reforma Institucional

El radar te muestra, para ese candidato, **cuanto coincide contigo
en cada tema por separado**.

Ejemplo: puedes coincidir 90% con un candidato en Economia (los dos
quieren bajar impuestos), pero solo 30% en Derechos Humanos (el
candidato opina lo opuesto a ti en aborto, por ejemplo).

Sirve para casos como:
- "Me sale 70% con este candidato, ¿pero en que temas exactamente?"
- "Este 80% es solido en todos los ejes, o hay uno flojo?"
- "Coincido mucho con A en economia pero mucho mas con B en ambiente,
  ¿por cual me inclino?"

**El match total es un promedio. El radar es la foto por dentro.**

---

## ¿De donde salen las posturas de los candidatos?

De cosas que ellos mismos dijeron o hicieron:

- Entrevistas y declaraciones publicas
- Votos registrados en el Congreso
- Leyes que firmaron o vetaron
- Plataformas oficiales de campana

**Importante**: la app esta en fase MVP (version 0.1). Muchas de las
posturas actuales estan marcadas como "borrador — pendiente de
verificacion". Antes de tomar una decision de voto real, revisa las
justificaciones y las fuentes citadas.

Estamos trabajando en verificar las 72 posturas contra fuentes primarias
para la version 0.2.

---

## ¿Que NO hace la app?

- **No te dice por quien votar.** Te muestra afinidades, no
  recomendaciones.
- **No usa tu ubicacion, contactos, ni datos personales** mas alla
  de un usuario+contrasena para guardar tus respuestas.
- **No comparte tus respuestas con nadie.** Ni con partidos, ni con
  encuestadoras, ni con anunciantes.
- **No te va a mostrar publicidad politica** dentro de la app.
- **No es una encuesta.** No sumamos tus respuestas para reportar
  estadisticas. Son solo tuyas.

---

## Preguntas frecuentes

**¿Puedo cambiar mis respuestas despues?**
En esta version, si vuelves a hacer el cuestionario, se sobreescriben.
En proximas versiones vas a poder ver como cambia el match si modificas
una respuesta en particular.

**¿Que pasa si el candidato no tiene postura sobre una pregunta?**
Esa pregunta se ignora para *ese* candidato. Sigue contando para los
otros. El candidato queda con "menos preguntas consideradas" y por
lo tanto con confianza mas baja en su match.

**¿Es imparcial?**
La formula del calculo si — trata a todos los candidatos con el mismo
metodo. Pero las **preguntas elegidas** y las **posturas registradas**
las hacen personas, y eso puede tener sesgos. Por eso publicamos las
fuentes: si tu crees que asignamos mal una postura, puedes revisar y
proponer un cambio.

**¿Sirve solo para Chile?**
Por ahora si. Las 12 preguntas y los 6 candidatos son especificos de la
eleccion presidencial chilena. La arquitectura permite agregar mas
elecciones (municipales, senadores) en el futuro.

**¿Puedo confiar en el match para decidir mi voto?**
Es una herramienta de apoyo, no un oraculo. Sumale otras fuentes: leer
sobre los candidatos, ver debates, hablar con personas de tu confianza.
El match te ahorra el filtrado inicial ("quienes son mis 3 mas
compatibles") pero la decision final es tuya.

---

## En una linea

**Respondes 12 preguntas honestamente, la app compara tus respuestas
con lo que cada candidato dijo o hizo, y te muestra un ranking con
cuanto coincide cada uno contigo — respetando lo que a ti te importa
mas.**

---

_Version 1.0 de este documento — 2026-07-25._
_Si algo no se entiende, abrite un issue en GitHub o escribinos y lo
mejoramos._
