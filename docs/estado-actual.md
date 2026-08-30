> **Este documento reemplaza a `estado-actual-desactualizado.md`.**
> Foto honesta del estado del proyecto a 2026-08-30.

# Estado actual — Tinder Decisivo

> Este documento responde tres preguntas:
> 1. Que funcionalidades ya funcionan de punta a punta
> 2. Que falta para tener un MVP publicable
> 3. Como esta el entorno de desarrollo actualmente

---

## 1. Entorno de desarrollo — estado post-fix (2026-08-30)

### Backend

| Componente | Estado |
|------------|--------|
| Python 3.10+ / uv | ✅ Funcionando |
| Django 5.2 + DRF | ✅ Funcionando |
| Migraciones aplicadas | ✅ 0 migraciones pendientes |
| Datos de ejemplo importados | ✅ 12 preguntas, 6 candidatos, 72 posturas |
| Superuser creado | ✅ |
| Dev server (`0.0.0.0:8010`) | ✅ Funcionando |
| `uv.lock` regenerado contra PyPI publico | ✅ Resuelto (era registry Walmart) |

### Frontend

| Componente | Estado |
|------------|--------|
| Node.js LTS v24.19.0 / v20.x+ | ✅ Instalado via `winget --scope user` (`%LOCALAPPDATA%\Programs\nodejs`) |
| `node_modules/` instalados desde `registry.npmjs.org` | ✅ 860 paquetes, 0 vulnerabilidades |
| Paridad React 19 Engine (`react` & `react-dom` `"19.2.3"`) | ✅ Fijada versión exacta en `dependencies` |
| Bloque `overrides` en `package.json` | ✅ Implementado para forzar paridad `19.2.3` transitiva |
| Metro Bundler servidor dev | ✅ Incorporado al pipeline (`npx expo start --web --port 8081`) |
| `expo/tsconfig.base` resuelto | ✅ Disponible en `node_modules/expo/tsconfig.base.json` |
| `tsconfig.json` canonico (Expo SDK 57 + TS strict) | ✅ Correcto |
| `npx expo customize tsconfig.json` | ✅ Ejecutado |
| `npx tsc --noEmit` | ✅ **0 errores** |
| `package-lock.json` corporativo eliminado | ✅ Regenerado contra registry publico |

---

## 2. Estado por feature

### Leyenda

| Simbolo | Significado |
|---------|-------------|
| ✅ | Funciona end-to-end (backend + UI + tests) |
| ⚠️ PARCIAL | Backend listo pero sin UI, o UI sin backend |
| ❌ FALTA | No existe todavia |

### Tabla de features

| # | Feature | Backend | UI | Tests | Estado |
|---|---------|---------|----|----|--------|
| 1 | Registro de usuario | ✅ | ✅ | ✅ | **✅** |
| 2 | Login / Logout | ✅ | ✅ | ✅ | **✅** |
| 3 | Ver tipos de eleccion (Home) | ✅ | ✅ | - | **✅** |
| 4 | Ver preguntas pendientes del cuestionario | ✅ | ✅ | ✅ | **✅** |
| 5 | Responder pregunta (opcion + peso) | ✅ | ✅ | ✅ | **✅** |
| 6 | Enviar cuestionario completo | ✅ | ✅ | ✅ | **✅** |
| 7 | Ver "cuestionario enviado" (SubmitDone) | - | ✅ | - | **✅** |
| 8 | Ver ranking de candidatos (Resultados) | ✅ | ✅ | ✅ | **✅** |
| 9 | Ver detalle de candidato con radar por eje | ✅ | ✅ | - | **✅** |
| 10 | Ver noticias de un candidato | ✅ | ✅ | ✅ | **✅** |
| 11 | Modal educativo con repercusiones | ✅ | ✅ | - | **✅** |
| 12 | Nivel de confianza en el match (alta/media/tentativa) | ✅ | ✅ | ✅ | **✅** |
| 13 | Marcar candidatos como favoritos | ✅ | ⚠️ | ✅ backend | **⚠️ PARCIAL** |
| 14 | Marcar candidatos como descartados | ✅ | ⚠️ | ✅ backend | **⚠️ PARCIAL** |
| 15 | Guardar decision final de voto | ✅ | ⚠️ | ✅ backend | **⚠️ PARCIAL** |
| 16 | Ver historial de mis respuestas | ❌ | ❌ | - | **❌ FALTA** |
| 17 | Editar/rehacer respuestas ya enviadas | ❌ | ❌ | - | **❌ FALTA** |
| 18 | "Olvide mi contrasena" (reset por email) | ❌ | ❌ | - | **❌ FALTA** |
| 19 | Pantalla de perfil/settings | ❌ | ❌ | - | **❌ FALTA** |
| 20 | Onboarding / tour inicial | ❌ | ❌ | - | **❌ FALTA** |
| 21 | Compartir resultado (link o imagen) | ❌ | ❌ | - | **❌ FALTA** |
| 22 | Modo invitado (probar sin registrarse) | ❌ | ❌ | - | **❌ FALTA** |
| 23 | Panel admin para editar posturas | Django admin | - | - | Basico via Django admin |

### Score de completitud

- **12 features ✅** de punta a punta — ~55% del scope razonable
- **3 features ⚠️ PARCIAL** con backend construido pero sin UI (deuda visible)
- **8 features ❌ FALTAN** (algunas nice-to-have, otras bloqueantes para publicar)

---

## 3. Gap analysis — camino a MVP publicable

### 3.1 El elefante en la sala: features 13-15

Backend tiene 3 features enteras que el usuario nunca ve:
- `POST /candidatos/{id}/favoritos/` + GET + DELETE
- `POST /candidatos/{id}/descartados/` + GET + DELETE
- `POST /decision-final/` + GET + PUT

Los modelos, serializers, views y tests estan. Los tipos TypeScript estan auto-generados en `src/types/api.ts`. Pero hay cero llamadas desde el frontend.

**Dos caminos**:
- **Camino A (usar la deuda)**: agregar la UI. ~1 sprint. Botones "favorito" / "descartar" en `ResultadosScreen`. Aprovecha lo hecho.
- **Camino B (borrar la deuda)**: eliminar los 3 modulos backend + migrations + tests. ~1 dia. Deja el codebase mas honesto.

**Recomendacion**: Camino A. La feature aporta valor real (una VAA sin "guarda tus favoritos" pierde retencion).

### 3.2 Features criticas faltantes

| Feature | Por que bloquea | Esfuerzo estimado |
|---------|-----------------|-------------------|
| Olvide contrasena | Sin esto, un user que olvida su pass pierde su historial para siempre | 1-2 dias |
| Modo invitado | Barrera de registro mata conversion. El user debe responder 12 preguntas ANTES de ver si vale la pena registrarse | 2-3 dias |

---

## 4. Gobernanza de entorno — reglas de aislamiento

### Regla 1: siempre especificar el registry al instalar dependencias frontend

```bash
npm install --legacy-peer-deps --registry=https://registry.npmjs.org/
```

Nunca omitir `--registry` si el entorno puede haber heredado configuracion corporativa.

### Regla 2: el `package-lock.json` en el repo debe provenir del registry publico

Antes de commitear un `package-lock.json`, verificar que no contiene URLs de registries privados:

```bash
grep -c "artifacts.walmart.com" package-lock.json
# Debe devolver 0
```

Si devuelve > 0: borrar el lockfile, reinstalar desde el registry publico, re-commitear.

### Regla 3: regenerar el `uv.lock` solo con PyPI publico

```bash
uv cache clean
uv sync --upgrade --default-index https://pypi.org/simple
```

### Regla 4: `npx tsc --noEmit` debe pasar con 0 errores antes de commitear

Esto esta en `package.json` como `npm run typecheck`. Los pre-commit hooks (cuando se implementen) deben incluirlo.

### Regla 5: instalar Node.js en Windows sin privilegios de administrador

```powershell
winget install OpenJS.NodeJS.LTS --scope user --accept-source-agreements --accept-package-agreements
```

Usar `--scope user` para instalacion en perfil de usuario (`%LOCALAPPDATA%\Programs\nodejs`). No requiere UAC.

### Regla 6: paridad estricta React 19 Engine & bloque `overrides`

`react` y `react-dom` deben estar fijados exactamente en `"19.2.3"` en `dependencies` y replicados en el bloque `"overrides"` de `frontend/package.json`:

```json
"overrides": {
  "react": "19.2.3",
  "react-dom": "19.2.3"
}
```

Evita errores de incompatibilidad en tiempo de ejecución (`react-dom@19.2.8` vs `react@19.2.3`).

### Regla 7: purga de caché obligatoria en Metro Bundler al alterar dependencias

Al modificar `package.json` o actualizar paquetes en `node_modules`, iniciar siempre Metro con la bandera `-c` (`--clear`):

```bash
npx expo start --web --port 8081 -c
```

### Regla 8: recarga de variables de entorno en sesiones activas de PowerShell

Si se instala Node.js o herramientas de CLI sin reiniciar la consola, ejecutar:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

---

_Ultima revision: 2026-08-30 (post sprint 9 — paridad React 19 & Metro -c)._
