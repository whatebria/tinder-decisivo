# Documentacion del backend

Guia completa del backend Django/DRF de **VotoAFin** (repo: tinder-decisivo).

Esta carpeta contiene docs **especificas del backend**, en detalle y separadas
por tema. Hay tres vistas paralelas segun tu audiencia y proposito:

## Referencia exhaustiva archivo por archivo (raiz de esta carpeta)

Para quien quiere una descripcion literal de TODO el codigo (cada archivo, cada campo, cada endpoint) sin narrativa ni interpretacion.

- [`BACKEND_COMPLETO.md`](BACKEND_COMPLETO.md) - Secciones 1-7: config, modelos, serializers, services, views/URLs, admin/auth/apps/pagination/conftest, management commands.
- [`08_migraciones.md`](08_migraciones.md) - documento legacy: 38 migraciones (pre-0039). Para el historial actualizado ver `tecnico/07-migraciones.md`.
- [`09_tests.md`](09_tests.md) - documento legacy: 25 archivos de test descritos. Para el estado actual ver `tecnico/10-tests.md`.
- [`10_fixtures.md`](10_fixtures.md) - CSVs de fixtures + README de importers.
- [`11_docs_internos.md`](11_docs_internos.md) - el plan de migracion territorial + drift detectado.

## Serie tecnica narrativa (`tecnico/`)

Para devs, revisores tecnicos, tesis capitulo de implementacion.

1. [`01-arquitectura.md`](tecnico/01-arquitectura.md) - stack, layout, apps, config, como levantar el entorno.
2. [`02-modelos.md`](tecnico/02-modelos.md) - los 19 modelos de dominio con relaciones, constraints y ejemplos.
3. [`03-api-endpoints.md`](tecnico/03-api-endpoints.md) - todos los endpoints REST con metodo, permisos, payload/response.
4. [`04-algoritmo-matching.md`](tecnico/04-algoritmo-matching.md) - deep-dive del algoritmo de matching y filtro territorial.
5. [`05-servicios.md`](tecnico/05-servicios.md) - la capa `services/` (matching, respuestas, password_reset, perfil).
6. [`06-comandos-seeds.md`](tecnico/06-comandos-seeds.md) - los 16 management commands: que hacen, en que orden.
7. [`07-migraciones.md`](tecnico/07-migraciones.md) - narrativa de las 42 migrations con las decisiones clave.
8. [`08-signals.md`](tecnico/08-signals.md) - todos los `post_save` / `pre_save` y su intencion.
9. [`09-auth-y-perfil.md`](tecnico/09-auth-y-perfil.md) - token auth, registro, password reset, perfil territorial.
10. [`10-tests.md`](tecnico/10-tests.md) - estrategia de tests, fixtures, como correrlos.

## Serie simple (`simple/`)

Para audiencia no tecnica: usuarios avanzados, tesis capitulo de contexto, product.

1. [`01-que-hace-el-backend.md`](simple/01-que-hace-el-backend.md) - analogia + tour visual sin codigo.
2. [`02-datos-que-guarda.md`](simple/02-datos-que-guarda.md) - que informacion vive ahi y por que.
3. [`03-como-hace-el-match.md`](simple/03-como-hace-el-match.md) - explicacion del matching sin ecuaciones.
4. [`04-como-agregar-cosas.md`](simple/04-como-agregar-cosas.md) - admin paso a paso para agregar candidatos, preguntas, ejes.
5. [`05-troubleshooting.md`](simple/05-troubleshooting.md) - levantar el entorno, errores comunes.

## Relacion con otras docs

- Docs generales del sistema (front + back combinados): [`../sistema-tecnico.md`](../sistema-tecnico.md), [`../sistema-simple.md`](../sistema-simple.md).
- Algoritmo de matching en profundidad conceptual: [`../algoritmo-tecnico-desactualizado.md`](../algoritmo-tecnico-desactualizado.md) *(pendiente actualizacion)*, [`../algoritmo-simple-desactualizado.md`](../algoritmo-simple-desactualizado.md) *(pendiente actualizacion)*.
- Buenas practicas de codigo: [`../buenas-practicas.md`](../buenas-practicas.md).
- Estado del proyecto y sprints: [`../estado-actual-desactualizado.md`](../estado-actual-desactualizado.md) *(pendiente actualizacion)*, [`../sprints.md`](../sprints.md).

Los docs de `docs/backend/` complementan (no reemplazan) los generales:
son mas granulares y hablan solo del backend.

## Convenciones

- Espanol neutro (tuteo).
- Sin emojis en el codigo o commands.
- Snippets de codigo cortos; el codigo completo vive en el repo.
- Cada doc arranca con "para quien es" y "para que sirve".
